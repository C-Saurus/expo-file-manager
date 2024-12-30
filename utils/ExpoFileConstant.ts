import * as FileSystem from 'expo-file-system';

export const LOCAL_EXPO_FOLDER = FileSystem.documentDirectory
const FOLDER_PATHS = [
  `${FileSystem.documentDirectory}Image`,
  `${FileSystem.documentDirectory}Video`,
  `${FileSystem.documentDirectory}Audio`,
  `${FileSystem.documentDirectory}Pdf`,
  `${FileSystem.documentDirectory}Doc`,
  `${FileSystem.documentDirectory}Txt`,
  `${FileSystem.documentDirectory}Excel-Csv`,
  `${FileSystem.documentDirectory}Custom`,
];

export const createFolders = async () => {
  try {
    for (const path of FOLDER_PATHS) {
      const folderExists = await FileSystem.getInfoAsync(path);
      if (!folderExists.exists) {
        await FileSystem.makeDirectoryAsync(path, { intermediates: true });
      }
    }
    console.log('Folders created successfully');
  } catch (error) {
    console.error('Error creating folders:', error);
  }
};
