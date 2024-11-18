import { Dimensions } from 'react-native';

export const { width: SIZE, height: HEIGHT } = Dimensions.get('window');

export const reExt = new RegExp(/(?:\.([^.]+))?$/);
export const base64reg = /data:image\/[^;]+;base64,/;

import RNFS from 'react-native-fs';

export const TRASH_FOLDER = `${RNFS.DocumentDirectoryPath}/trash`;
export const ensureTrashFolderExists = async () => {
  const exists = await RNFS.exists(TRASH_FOLDER);
  if (!exists) {
    await RNFS.mkdir(TRASH_FOLDER);
  }
};

export const moveFileToTrash = async (filePath) => {
  await ensureTrashFolderExists();
  const fileName = filePath.split('/').pop();
  const destination = `${TRASH_FOLDER}/${fileName}`;
  await RNFS.moveFile(filePath, destination);
  return destination;
};

export const cleanOldFiles = async () => {
  const files = await RNFS.readDir(TRASH_FOLDER);
  const now = Date.now();
  files.forEach(async (file) => {
    const lastModified = new Date((await RNFS.stat(file.path)).mtime).getTime();
    if (now - lastModified > 30 * 24 * 60 * 60 * 1000) { // 30 ngày
      await RNFS.unlink(file.path);
    }
  });
};

export const setDailyInterval = () => {
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

  // Thực hiện kiểm tra và xoá ngay lần đầu
  cleanOldFiles();

  // Lặp lại mỗi ngày
  setInterval(() => {
    console.log('Checking for old files to delete...');
    cleanOldFiles();
  }, ONE_DAY_IN_MS);
};

export const fileIcons = {
  json: 'code-json',
  pdf: 'file-pdf-box',
  msword: 'file-word-outline',
  'vnd.openxmlformats-officedocument.wordprocessingml.document':
    'file-word-outline',
  'vnd.ms-excel': 'file-excel-outline',
  'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel-outline',
  'vnd.ms-powerpoint': 'file-powerpoint-outline',
  'vnd.openxmlformats-officedocument.presentationml.presentation':
    'file-powerpoint-outline',
  zip: 'folder-zip-outline',
  'vnd.rar': 'folder-zip-outline',
  'x-7z-compressed': 'folder-zip-outline',
  xml: 'xml',
  css: 'language-css3',
  csv: 'file-delimited-outline',
  html: 'language-html5',
  javascript: 'language-javascript',
  plain: 'text-box-outline',
};

export const videoFormats = ['mp4', 'mov'];
export const imageFormats = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'tiff',
  'tif',
  'heic',
  'bmp',
];

export const Poppins_400Regular = 'Poppins_400Regular';
export const Poppins_500Medium = 'Poppins_500Medium';
export const Poppins_600SemiBold = 'Poppins_600SemiBold';
export const Poppins_700Bold = 'Poppins_700Bold';
