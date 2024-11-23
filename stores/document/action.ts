import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDocumentFiles } from '../../utils/getFileByCategory';
import RNFS from 'react-native-fs';

export const fetchFiles = createAsyncThunk('files/fetchFiles', async () => {
  const files = await getDocumentFiles();
  console.log("files", files);
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
