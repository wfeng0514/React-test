import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Section, Button, DownloadButton, ProgressContainer, ResultContainer } from './styles';
import { FileInfo, UploadState, DownloadState, FileTransferProps } from './types';

const FileTransfer: React.FC<FileTransferProps> = ({ uploadUrl, downloadUrl, listFilesUrl }) => {
  // 上传状态
  const [upload, setUpload] = useState<UploadState>({
    progress: 0,
    isUploading: false,
    isPaused: false,
    uploadedFile: null,
    error: null,
  });

  // 下载状态
  const [download, setDownload] = useState<DownloadState>({
    progress: 0,
    isDownloading: false,
    isPaused: false,
    downloadUrl: null,
    error: null,
    availableFiles: [],
  });

  const [selectedFile, setSelectedFile] = useState<string>('');
  const uploadCancelToken = useRef(axios.CancelToken.source());
  const downloadCancelToken = useRef(axios.CancelToken.source());

  // 获取已上传文件列表
  useEffect(() => {
    fetchAvailableFiles();
  }, []);

  const fetchAvailableFiles = async () => {
    try {
      const response = await axios.get(listFilesUrl);
      setDownload((prev) => ({
        ...prev,
        availableFiles: response.data.files,
      }));
    } catch (error) {
      console.error('获取文件列表失败:', error);
    }
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // 检查文件类型
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        setUpload((prev) => ({
          ...prev,
          error: '仅支持上传Excel文件 (.xlsx, .xls)',
        }));
        return;
      }

      setUpload((prev) => ({
        ...prev,
        error: null,
      }));
    }
  };

  // 开始上传
  const startUpload = async () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    uploadCancelToken.current = axios.CancelToken.source();

    setUpload({
      progress: 0,
      isUploading: true,
      isPaused: false,
      uploadedFile: null,
      error: null,
    });

    try {
      const response = await axios.post(uploadUrl, formData, {
        cancelToken: uploadCancelToken.current.token,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUpload((prev) => ({ ...prev, progress }));
          }
        },
      });

      setUpload((prev) => ({
        ...prev,
        isUploading: false,
        uploadedFile: response.data.file,
      }));

      // 刷新文件列表
      await fetchAvailableFiles();
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('上传已取消');
      } else {
        setUpload((prev) => ({
          ...prev,
          isUploading: false,
          error: error instanceof Error ? error.message : '上传失败',
        }));
      }
    }
  };

  // 暂停上传
  const pauseUpload = () => {
    uploadCancelToken.current.cancel('上传已暂停');
    setUpload((prev) => ({
      ...prev,
      isUploading: false,
      isPaused: true,
    }));
  };

  // 继续上传
  const resumeUpload = () => {
    startUpload();
  };

  // 开始下载
  const startDownload = async () => {
    if (!selectedFile) return;

    downloadCancelToken.current = axios.CancelToken.source();

    setDownload((prev) => ({
      ...prev,
      progress: 0,
      isDownloading: true,
      isPaused: false,
      downloadUrl: null,
      error: null,
    }));

    try {
      const response = await axios.get(`${downloadUrl}?filename=${selectedFile}`, {
        cancelToken: downloadCancelToken.current.token,
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setDownload((prev) => ({ ...prev, progress }));
          }
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownload((prev) => ({
        ...prev,
        isDownloading: false,
        downloadUrl: url,
      }));
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('下载已取消');
      } else {
        setDownload((prev) => ({
          ...prev,
          isDownloading: false,
          error: error instanceof Error ? error.message : '下载失败',
        }));
      }
    }
  };

  // 暂停下载
  const pauseDownload = () => {
    downloadCancelToken.current.cancel('下载已暂停');
    setDownload((prev) => ({
      ...prev,
      isDownloading: false,
      isPaused: true,
    }));
  };

  // 继续下载
  const resumeDownload = () => {
    startDownload();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="Container">
      <h1>Excel文件传输</h1>

      <div className="Section">
        <h2>文件上传</h2>
        <input id="file-upload" type="file" onChange={handleFileChange} accept=".xlsx, .xls" disabled={upload.isUploading} />

        {upload.error && (
          <div className="ResultContainer" style={{ color: 'red' }}>
            {upload.error}
          </div>
        )}

        {upload.isUploading && (
          <div className="ProgressContainer">
            <p>上传进度: {upload.progress}%</p>
            <progress value={upload.progress} max="100" style={{ width: '100%' }} />
            <div>
              <Button onClick={pauseUpload}>暂停</Button>
            </div>
          </div>
        )}

        {upload.isPaused && (
          <div>
            <p>上传已暂停</p>
            <Button onClick={resumeUpload}>继续</Button>
          </div>
        )}

        {upload.uploadedFile && (
          <div className="ResultContainer">
            <h3>上传完成!</h3>
            <p>文件名: {upload.uploadedFile.name}</p>
            <p>文件大小: {upload.uploadedFile.size}</p>
            <p>文件类型: {upload.uploadedFile.type}</p>
            <p>最后修改时间: {upload.uploadedFile.lastModified}</p>
          </div>
        )}

        {!upload.isUploading && !upload.isPaused && !upload.uploadedFile && (
          <Button onClick={startUpload} disabled={!document.getElementById('file-upload')?.files?.length} style={{ marginTop: '10px' }}>
            开始上传
          </Button>
        )}
      </div>

      <Section>
        <h2>文件下载</h2>
        <div style={{ marginBottom: '15px' }}>
          <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)} style={{ padding: '5px', minWidth: '200px' }}>
            <option value="">选择文件</option>
            {download.availableFiles.map((file, index) => (
              <option key={index} value={file.name}>
                {file.name} ({file.size})
              </option>
            ))}
          </select>
        </div>

        {download.error && (
          <div className="ResultContainer" style={{ color: 'red' }}>
            {download.error}
          </div>
        )}

        {download.isDownloading && (
          <div className="ProgressContainer">
            <p>下载进度: {download.progress}%</p>
            <progress value={download.progress} max="100" style={{ width: '100%' }} />
            <div>
              <Button onClick={pauseDownload}>暂停</Button>
            </div>
          </div>
        )}

        {download.isPaused && (
          <div>
            <p>下载已暂停</p>
            <Button onClick={resumeDownload}>继续</Button>
          </div>
        )}

        {download.downloadUrl && (
          <ResultContainer>
            <h3>下载准备完成!</h3>
            <DownloadButton href={download.downloadUrl} download={selectedFile}>
              点击下载
            </DownloadButton>
          </ResultContainer>
        )}

        {!download.isDownloading && !download.isPaused && !download.downloadUrl && (
          <Button onClick={startDownload} disabled={!selectedFile}>
            开始下载
          </Button>
        )}
      </Section>
    </div>
  );
};

export default FileTransfer;
