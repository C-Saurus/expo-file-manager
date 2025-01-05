export const DATA = [
  { id: '0', title: 'Images', icon: 'photo-library', color: '#3194d6' },
  { id: '1', title: 'Video', icon: 'videocam', color: '#da4256' },
  { id: '2', title: 'Audio', icon: 'audiotrack', color: '#d69c31' },
  { id: '3', title: 'PDF', icon: 'picture-as-pdf', color: '#d63131' },
  { id: '4', title: 'Apps', icon: 'apps', color: '#d631ce' },
  { id: '5', title: 'Zip', icon: 'archive', color: '#57595f' },
  { id: '6', title: 'Document', icon: 'description', color: '#3165d6' },
  { id: '7', title: 'Text', icon: 'text-fields', color: '#3fd631' },
];

export const FILE_TYPES = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
  video: ['mp4', 'mkv', 'avi', 'mov'],
  audio: ['mp3', 'wav', 'aac', 'flac'],
  pdf: ['pdf'],
  app: ['apk'],
  zip: ['zip', 'rar'],
  document: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  download: [],
};

export const DATA_FOLDER = [
  { id: '0', title: 'Hình ảnh', icon: 'photo-library' },
  { id: '1', title: 'Video', icon: 'videocam' },
  { id: '2', title: 'Âm thanh', icon: 'audiotrack' },
  { id: '3', title: 'PDF', icon: 'picture-as-pdf' },
  { id: '4', title: 'Các tài liệu', icon: 'description' },
];

export enum LOCK_TYPE {
  NONE,
  PIN,
  BIOMETRIC,
  BOTH
}