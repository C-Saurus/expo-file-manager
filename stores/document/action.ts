import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAllFiles } from '../../utils/getFileByCategory';
import RNFS, { ReadDirItem } from 'react-native-fs';
import {
  copyFileToCustomeFolder,
  moveFileToCustomeFolder,
  moveFileToTrash,
} from '../../utils/Constants';

export const fetchFiles = createAsyncThunk('files/fetchFiles', async () => {
  const files = await getAllFiles();
  return files;
});

export const renameFiles = createAsyncThunk(
  'files/rename',
  async (
    { oldPath, newPath }: { oldPath: string; newPath: string },
    { rejectWithValue }
  ) => {
    try {
      await RNFS.moveFile(oldPath, newPath);
      return { oldPath, newPath };
    } catch (error) {
      rejectWithValue(error);
    }
  }
);

export const removeFileToTrash = async (
  filestoBeDeleted?: string[]
) => {
  try {
    const promises = filestoBeDeleted.map((file) => {
      return moveFileToTrash(file);
    });

    const filestoBeDeletedRes = await Promise.all(promises);
    return filestoBeDeletedRes;
  } catch (error) {
    console.log('[ERR]', error);
    throw error
  }
}

export const moveFileToCustomeFolderRequest = createAsyncThunk(
  'files/moveFileToCustomeFolder',
  async (
    {
      filestoBeDeleted,
      folder,
    }: { filestoBeDeleted?: ReadDirItem[]; folder: string },
    { rejectWithValue }
  ) => {
    try {
      const promises = filestoBeDeleted.map((file) => {
        return moveFileToCustomeFolder(file.path, folder);
      });

      const filestoBeDeletedRes = await Promise.all(promises);
      return { filestoBeDeletedRes, folder };
    } catch (error) {
      console.log('[ERR]', error);
      rejectWithValue(error);
    }
  }
);

export const copyFileToCustomeFolderRequest = createAsyncThunk(
  'files/copyFileToCustomeFolder',
  async (
    {
      filestoBeDeleted,
      folder,
    }: { filestoBeDeleted?: ReadDirItem[]; folder: string },
    { rejectWithValue }
  ) => {
    try {
      const promises = filestoBeDeleted.map((file) => {
        return copyFileToCustomeFolder(file.path, folder);
      });

      const filestoBeDeletedRes = await Promise.all(promises);
      return { filestoBeDeletedRes, folder };
    } catch (error) {
      console.log('[ERR]', error);
      rejectWithValue(error);
    }
  }
);

export const updateSelectedItemInListFile = (
  files: ReadDirItem & { isSelected?: boolean }[]
) => {};
