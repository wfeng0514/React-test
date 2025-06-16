const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// 增强的CORS配置
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-file-hash', // 添加你的自定义头部
      'x-chunk-index', // 添加其他可能用到的头部
    ],
  }),
);

// 增强的请求体解析
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 安全响应头
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json;charset=UTF-8');
  res.header('X-Content-Type-Options', 'nosniff');
  next();
});

// 安全的路径解析函数
const resolveSafePath = (baseDir, ...paths) => {
  const resolvedPath = path.resolve(baseDir, ...paths);
  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error('Invalid path traversal attempt');
  }
  return resolvedPath;
};

// 文件存储目录配置
const UPLOAD_BASE = path.resolve(__dirname, 'uploads');
const UPLOAD_DIR = resolveSafePath(UPLOAD_BASE, 'completed');
const TEMP_DIR = resolveSafePath(UPLOAD_BASE, 'temp');

// 确保目录存在（安全创建）
const ensureDirExists = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
    }
  } catch (err) {
    console.error(`Failed to create directory ${dirPath}:`, err);
    throw err;
  }
};

// 初始化目录
[UPLOAD_DIR, TEMP_DIR].forEach(ensureDirExists);

// 增强的文件名安全处理
const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return 'unnamed';

  // 解码URI组件并替换非法字符
  try {
    const decoded = decodeURIComponent(filename);
    return decoded
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-._ ]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 255);
  } catch (e) {
    console.warn('Failed to decode filename:', filename);
    return 'invalid_filename';
  }
};

// 普通文件上传配置
const upload = multer({
  dest: UPLOAD_DIR,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // 可以添加文件类型检查
    cb(null, true);
  },
});

// 普通文件上传端点
app.post('/upload', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const originalName = sanitizeFilename(req.file.originalname);
    const newPath = resolveSafePath(UPLOAD_DIR, `${uuidv4()}_${originalName}`);

    // 重命名文件以包含原始文件名
    fs.renameSync(req.file.path, newPath);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      filename: path.basename(newPath),
      originalname: originalName,
      size: req.file.size,
      path: newPath,
    });
  } catch (err) {
    next(err);
  }
});

// 分片上传配置
const chunkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileHash = req.headers['x-file-hash'];

    const chunkDir = path.resolve(TEMP_DIR, fileHash);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }
    cb(null, chunkDir);
  },
  filename: (req, file, cb) => cb(null, `${req.headers['x-chunk-index']}`),
});

const chunkUpload = multer({
  storage: chunkStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per chunk
    files: 1,
  },
});

// 验证文件端点
app.post('/verify', (req, res, next) => {
  try {
    const { fileHash, filename } = req.body;

    if (!fileHash || !filename) {
      throw new Error('Missing fileHash or filename');
    }

    const safeFilename = sanitizeFilename(filename);
    const filePath = resolveSafePath(UPLOAD_DIR, safeFilename);

    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
      return res.json({
        shouldUpload: false,
        message: 'File already exists',
        existingFile: safeFilename,
      });
    }

    // 检查分片目录
    const chunkDir = resolveSafePath(TEMP_DIR, fileHash);
    let uploadedChunks = [];

    if (fs.existsSync(chunkDir)) {
      uploadedChunks = fs
        .readdirSync(chunkDir)
        .map(Number)
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);
    }

    res.json({
      shouldUpload: true,
      uploadedChunks,
      suggestedFilename: safeFilename,
    });
  } catch (err) {
    next(err);
  }
});

// 上传分片端点
app.post('/upload-chunk', chunkUpload.single('chunk'), (req, res, next) => {
  try {
    // console.log('req.body', req.body);
    if (!req.file) {
      throw new Error('No chunk file received');
    }

    const { fileHash, chunkIndex } = req.body;

    if (!fileHash || isNaN(chunkIndex)) {
      throw new Error('Missing fileHash or invalid chunkIndex');
    }

    res.json({
      success: true,
      message: 'Chunk uploaded successfully',
      chunkIndex: parseInt(chunkIndex),
      fileHash,
    });
  } catch (err) {
    next(err);
  }
});

// 合并分片端点
app.post('/merge', async (req, res, next) => {
  try {
    const { fileHash, filename, size } = req.body;
    console.log('req.body merge ====>', req.body);

    if (!fileHash || !filename || !size) {
      throw new Error('Missing required fields: fileHash, filename or size');
    }

    const safeFilename = sanitizeFilename(filename);
    console.log('safeFilename', safeFilename);
    const chunkDir = resolveSafePath(TEMP_DIR, fileHash);
    const filePath = resolveSafePath(UPLOAD_DIR, safeFilename);

    console.log('chunkDir', chunkDir);
    // 验证分片目录存在
    if (!fs.existsSync(chunkDir)) {
      throw new Error('Chunk directory not found');
    }

    // 获取分片列表并验证
    const chunks = fs
      .readdirSync(chunkDir)
      .map(Number)
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    if (chunks.length === 0) {
      throw new Error('No chunks found for merging');
    }

    // 检查分片连续性
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i] !== i) {
        throw new Error(`Missing chunk at index ${i}`);
      }
    }

    // 合并分片
    const writeStream = fs.createWriteStream(filePath);

    for (const chunkIndex of chunks) {
      const chunkPath = resolveSafePath(chunkDir, chunkIndex.toString());
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(chunkPath);
        readStream.pipe(writeStream, { end: false });
        readStream.on('end', () => {
          fs.unlinkSync(chunkPath);
          resolve();
        });
        readStream.on('error', reject);
      });
    }

    writeStream.end();

    // 验证文件大小
    const stats = fs.statSync(filePath);
    if (stats.size !== parseInt(size)) {
      fs.unlinkSync(filePath);
      throw new Error(`File size mismatch: expected ${size}, got ${stats.size}`);
    }

    // 清理临时目录
    fs.rmdirSync(chunkDir);

    res.json({
      success: true,
      message: 'File merged successfully',
      filename: safeFilename,
      size: stats.size,
      path: filePath,
    });
  } catch (err) {
    next(err);
  }
});

// 文件下载端点
app.get('/files/:filename', (req, res, next) => {
  try {
    const safeFilename = sanitizeFilename(req.params.filename);
    const filePath = resolveSafePath(UPLOAD_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.sendFile(filePath, {
      headers: {
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 增强的错误处理
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 启动服务器
const PORT = parseInt(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
  console.log(`Upload directory: ${UPLOAD_DIR}`);
  console.log(`Temp directory: ${TEMP_DIR}`);
});

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
