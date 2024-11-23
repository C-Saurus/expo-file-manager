import { createSlice } from '@reduxjs/toolkit';
import { fetchFiles, renameFiles } from './action';
import { RootState } from '..';
import * as mime from 'react-native-mime-types';
import { getCategoryByExtension } from '../../utils/getFileByCategory';

// Slice quản lý trạng thái file
export const documentSlice = createSlice({
  name: 'files',
  initialState: {
    docFiles: [],
    txtFiles: [],
    csvExcelFiles: [],
    otherFiles: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.docFiles = action.payload.docFiles;
        state.txtFiles = action.payload.txtFiles;
        state.csvExcelFiles = action.payload.csvExcelFiles;
        state.otherFiles = action.payload.otherFiles;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(renameFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(renameFiles.fulfilled, (state, action) => {
        state.loading = false;
        const {oldPath, newPath} = action.payload
        console.log("action", action.payload);
        const ext = newPath.split('.').pop();
        console.log("ext", ext);
        const category = getCategoryByExtension(ext);
        const fileName = newPath.split('/').pop();

        // Update the corresponding list
        if (category === 'doc') {
          state.docFiles = state.docFiles.map((file) =>
            file.path === oldPath ? { ...file, path: newPath, name: fileName } : file
          );
        } else if (category === 'txt') {
          state.txtFiles = state.txtFiles.map((file) =>
            file.path === oldPath ? { ...file, path: newPath, name: fileName } : file
          );
        } else if (category === 'csvExcel') {
          state.csvExcelFiles = state.csvExcelFiles.map((file) =>
            file.path === oldPath ? { ...file, path: newPath, name: fileName } : file
          );
        } else {
          state.otherFiles = state.otherFiles.map((file) =>
            file.path === oldPath ? { ...file, path: newPath, name: fileName } : file
          );
        }
      })
      .addCase(renameFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const selectDocument = (state: RootState) => state.documentFile;

export default documentSlice.reducer;
