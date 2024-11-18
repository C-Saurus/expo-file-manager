import { createSlice } from '@reduxjs/toolkit';
import { fetchFiles } from './action';
import { RootState } from '..';
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
      });
  },
});

export const selectDocument = (state: RootState) => state.documentFile;

export default documentSlice.reducer;
