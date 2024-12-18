import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAllFiles } from '../../utils/getFileByCategory';
import RNFS, { ReadDirItem } from 'react-native-fs';
import { moveFileToTrash } from '../../utils/Constants';

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
      return {oldPath, newPath}
    } catch (error) {
      rejectWithValue(error);
    }
  }
);

export const removeFileToTrash = createAsyncThunk(
  'files/moveToTrash',
  async (
    { filestoBeDeleted, fileType } : { filestoBeDeleted: ReadDirItem[], fileType: string },
    { rejectWithValue }
  ) => {
    try {
      const promises = filestoBeDeleted.map((file) => {
        return moveFileToTrash(file.path)
      });

      const filestoBeDeletedRes = await Promise.all(promises);
      return {filestoBeDeletedRes, fileType}
    } catch (error) {
      console.log("[ERR]", error)
      rejectWithValue(error);
    }
  }
);

