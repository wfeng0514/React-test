export interface FileInfo {
  name: string;
  size: string;
  type: string;
  lastModified: string;
  path?: string;
}

export interface UploadState {
  progress: number;
  isUploading: boolean;
  isPaused: boolean;
  uploadedFile: FileInfo | null;
  error: string | null;
}

export interface DownloadState {
  progress: number;
  isDownloading: boolean;
  isPaused: boolean;
  downloadUrl: string | null;
  error: string | null;
  availableFiles: FileInfo[];
}

export interface FileTransferProps {
  uploadUrl: string;
  downloadUrl: string;
  listFilesUrl: string;
}
