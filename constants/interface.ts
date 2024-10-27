export interface StorageData {
  image: number;
  video: number;
  audio: number;
  pdf: number;
  app: number;
  zip: number;
  document: number;
  download: number;
}

export interface FileItem {
  name: string;
  size: number;
  path: string;
  type?: string;
  hash?: string
}
