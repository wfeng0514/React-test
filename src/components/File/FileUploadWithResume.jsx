import { useState, useRef } from 'react';
import axios from 'axios';
import SparkMD5 from 'spark-md5'; // 引入 SparkMD5 库用于计算文件的 MD5 哈希值
import './styles.scss';

const CHUNK_SIZE = 5 * 1024; //5KB分片大小
const BaseURL = 'http://localhost:3001'; // 替换为后端服务地址
const UPLOAD_STATUS = {
  uploading: {
    text: '上传中...',
    color: '#2196F3',
  },
  success: {
    text: '上传成功',
    color: '#4CAF50',
  },
  error: {
    text: '上传失败',
    color: '#F44336',
  },
  paused: {
    text: '上传暂停',
    color: '#FFC107',
  },
  exists: {
    text: '文件已存在',
    color: '#2196F3',
  },
};

const FileUploadWithResume = () => {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedChunks, setUploadedChunks] = useState([]);

  // 使用 useRef 来存储取消令牌和上传类型
  const cancelToken = useRef(null);
  const isUploadType = useRef(null);


  /**
   * 读取文件并计算其 MD5 哈希值
   * @param {File} file - 要计算哈希值的文件对象
   * @returns {Promise<string>} - 一个 Promise 对象，resolve 时传回文件的 MD5 哈希值
   */
  const calculateHash = (file) => {
    return new Promise((resolve) => {
      const spark = new SparkMD5.ArrayBuffer();
      const fileReader = new FileReader();
      const chunks = Math.ceil(file.size / CHUNK_SIZE);
      let currentChunk = 0;

      fileReader.onload = (e) => {
        spark.append(e.target.result);
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          resolve(spark.end());
        }
      };

      const loadNext = () => {
        const start = currentChunk * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        fileReader.readAsArrayBuffer(file.slice(start, end));
      };

      loadNext();
    });
  };

  const verifyFile = async (hash, filename, size) => {
    try {
      const response = await axios.post(`${BaseURL}/verify`, {
        fileHash: hash,
        filename,
        size,
      });

      if (response.data.shouldUpload) {
        setUploadedChunks(response.data.uploadedChunks || []);
      } else {
        setUploadStatus('exists');
        setProgress(100);
      }
    } catch (error) {
      console.error('Verify error:', error);
      setUploadStatus('error');
    }
  };

  /**
   * 处理文件选择 ｜ 计算文件hash ｜ 验证文件
   * @param {*} e
   * @returns
   */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('calculating');
    setProgress(0);

    // 计算文件hash
    const hash = await calculateHash(file);

    setFile(file);
    setFileHash(hash);
    setUploadStatus('ready');

    // 验证文件
    await verifyFile(hash, file.name, file.size);
  };

  const uploadChunk = async ({ chunk, chunkIndex, fileHash, totalChunks }) => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex);
    formData.append('fileHash', fileHash);
    console.log('Uploading chunk:', chunkIndex, 'of file:', file.name, 'with hash:', fileHash);

    await axios.post(`${BaseURL}/upload-chunk`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', 'x-file-hash': fileHash, 'x-chunk-index': chunkIndex },
      cancelToken: cancelToken.current?.token,
    });

    console.log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully.`);
    const newProgress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
    setProgress(newProgress);
    setUploadedChunks((prev) => [...prev, chunkIndex]);
  };

  const reset = () => {
    setFile(null);
    setFileHash('');
    setUploadedChunks([]);
    cancelToken.current = null;
    isUploadType.current = null;
  };

  /**
   * 上传文件
   * 1. 上传文件
   * 2. 显示上传进度
   * 3. 上传完成后,更改上传状态
   * @returns {Promise<void>}
   */
  const handleUpload = async () => {
    if (!file) return;
    if (uploadStatus === 'uploading') {
      console.warn('Upload is already in progress');
      return;
    }
    if (uploadStatus === 'exists') {
      return;
    }

    isUploadType.current = 'normal';
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus('uploading');

      const response = await axios.post(`${BaseURL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data; charset=UTF-8' },
        onUploadProgress: (progressEvent) => {
          console.log('progressEvent ===>', progressEvent);

          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      reset()
      setUploadStatus('success');
      console.log('Upload successful:', response.data);
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
    }
  };

  /**
   * 上传大文件
   * 1. 获取未上传的分片
   * 2. 上传每个分片
   * 3. 所有分片上传完成，合并文件
   * @returns {Promise<void>}
   */
  const bigFileUpload = async () => {
    if (!file || !fileHash) return;
    if (uploadStatus === 'uploading') {
      console.warn('Upload is already in progress');
      return;
    }
    if (uploadStatus === 'exists') {
      return;
    }

    isUploadType.current = 'bigFile';
    cancelToken.current = axios.CancelToken.source();
    setUploadStatus('uploading');

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      console.log(`Total chunks to upload: ${totalChunks}`);

      // 获取未上传的分片
      const chunksToUpload = Array.from({ length: totalChunks })
        .map((_, i) => i)
        .filter((i) => !uploadedChunks.includes(i));
      for (const chunkIndex of chunksToUpload) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        // 上传分片
        await uploadChunk({ chunk, chunkIndex, fileHash, totalChunks });
      }

      // 所有分片上传完成，合并文件
      const mergeResponse = await axios.post(`${BaseURL}/merge`, {
        fileHash,
        filename: file.name,
        size: file.size,
      });

      reset()
      setUploadStatus('success');
      console.log('Upload complete:', mergeResponse.data);
    } catch (error) {
      if (axios.isCancel(error)) {
        setUploadStatus('paused');
        console.log('Upload paused:', error.message);
      } else {
        setUploadStatus('error');
        console.error('Upload failed:', error);
      }
    }
  };

  /**
   * 暂停上传
   * 1. 取消当前上传请求
   * 2. 更新上传状态为 paused
   * @returns {void}
   */
  const handlePause = () => {
    if (cancelToken.current) {
      cancelToken.current.cancel('Upload paused by user');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>文件上传（支持断点续传）</h2>

      <div className="file-upload-container">
        <div className="btn-container">
          <div className="btn" onClick={handleUpload} disabled={!file || uploadStatus !== 'ready'}>
            普通上传
          </div>
          <div className="btn" onClick={bigFileUpload} disabled={!file || !uploadedChunks.length}>
            {uploadStatus === 'paused' ? '继续上传' : '大文件上传'}
          </div>
          {uploadStatus === 'uploading' && (
            <div className="btn" onClick={handlePause}>
              暂停上传
            </div>
          )}
        </div>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} disabled={uploadStatus === 'calculating' || uploadStatus === 'uploading'} />
      </div>

      {uploadStatus === 'calculating' && <p>计算文件hash中...</p>}
      {uploadStatus === 'ready' && (
        <div className="file-info">
          <p>文件: {file.name}</p>
          <p>大小: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          <p>分片数: {Math.ceil(file.size / CHUNK_SIZE)}</p>
          <p>已上传分片: {uploadedChunks.length}</p>
        </div>
      )}

      {uploadStatus && uploadStatus !== 'ready' && uploadStatus !== 'calculating' && (
        <div className="file-info">
          <div className="progress">
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: `${UPLOAD_STATUS[uploadStatus]?.color}`,
                transition: 'width 0.3s, background-color 0.3s',
              }}
            />
          </div>
          <p>状态: {UPLOAD_STATUS[uploadStatus]?.text}</p>
          <p>进度: {progress}%</p>
          {isUploadType.current === 'bigFile' ? <p>已上传分片: {uploadedChunks.length}</p> : null}
        </div>
      )}
    </div>
  );
};

export default FileUploadWithResume;
