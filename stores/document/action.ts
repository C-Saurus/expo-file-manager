import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDocumentFiles } from '../../utils/getFileByCategory';

export const fetchFiles = createAsyncThunk('files/fetchFiles', async () => {
  const files = await getDocumentFiles();
  console.log("files", files);
  return files;
});
