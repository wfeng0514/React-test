import { useState, useRef } from 'react';
import axios from 'axios';
import SparkMD5 from 'spark-md5';
import './styles.scss';

const CHUNK_SIZE = 5 * 1024;
const BaseURL = 'http://192.168.185.98:3001'; // 替换为你的后端服务地址
const UPLOAD_STATUS = {
  uploading: '上传中...',
  success: '上传成功!',
  error: '上传失败',
  paused: '已暂停',
  exists: '文件已存在',
};

const FileUploadWithResume = () => {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedChunks, setUploadedChunks] = useState([]);
  const cancelToken = useRef(null);

  const calculateHash = (file) => {
    return new Promise((resolve) => {
      const spark = new SparkMD5.ArrayBuffer();
      const fileReader = new FileReader();
      const chunkSize = 2 * 1024 * 1024; // 2MB for hash calculation
      const chunks = Math.ceil(file.size / chunkSize);
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
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        fileReader.readAsArrayBuffer(file.slice(start, end));
      };

      loadNext();
    });
  };

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

  const handleUpload = async () => {
    if (!file) return;

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

      setUploadStatus('success');
      console.log('Upload successful:', response.data);
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
    }
  };
  const bigFileUpload = async () => {
    if (!file || !fileHash) return;

    cancelToken.current = axios.CancelToken.source();
    setUploadStatus('uploading');

    try {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      console.log(`Total chunks to upload: ${totalChunks}`);

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

  // const handlePause = () => {
  //   if (cancelToken.current) {
  //     cancelToken.current.cancel('Upload paused by user');
  //   }
  // };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* <h2>大文件上传（支持断点续传）</h2> */}
      <h2>文件上传</h2>

      <div className="file-upload-container">
        <div className="btn-container">
          <div className="btn" onClick={handleUpload} disabled={!file || uploadStatus !== 'ready'}>
            普通上传
          </div>
          <div className="btn" onClick={bigFileUpload} disabled={!file || uploadStatus !== 'ready'}>
            大文件上传
          </div>
          {/* {uploadStatus === 'uploading' && (
            <div className='btn' onClick={handlePause}>暂停上传</div>
          )} */}
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
                backgroundColor: uploadStatus === 'success' ? '#4CAF50' : uploadStatus === 'error' ? '#F44336' : uploadStatus === 'paused' ? '#FFC107' : '#2196F3',
                transition: 'width 0.3s, background-color 0.3s',
              }}
            />
          </div>
          <p>状态: {UPLOAD_STATUS[uploadStatus]}</p>
          <p>进度: {progress}%</p>
          <p>已上传分片: {uploadedChunks.length}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadWithResume;
