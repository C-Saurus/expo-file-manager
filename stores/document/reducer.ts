import { createSlice } from '@reduxjs/toolkit';
import { fetchFiles, moveFileToCustomeFolderRequest, removeFileToTrash, renameFiles } from './action';
import { RootState } from '..';
import { getCategoryByExtension } from '../../utils/getFileByCategory';

export const documentSlice = createSlice({
  name: 'files',
  initialState: {
    doc: [],
    txt: [],
    csvExcel: [],
    pdf: [],
    zip: [],
    apk: [],
    isMultiSelect: false,
    selectAll: false,
    selectedFile: [],
    currentSelectFileType: undefined,
    loading: false,
    error: null,
  },
  reducers: {
    sortByOption: (state, { payload }) => {
      console.log("payload", payload)
      const { value, type } = payload
      switch (value) {
        case 1:
          console.log("COME")
          state[type] = [...state[type]].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          break;
        case 2:
          state[type] = [...state[type]].sort((a, b) =>
            b.name.localeCompare(a.name)
          );
          break;
        case 3:
          state[type] = state[type].sort((a, b) => a.size - b.size);
          break;
        case 4:
          state[type] = state[type].sort((a, b) => b.size - a.size);
          break;
        default:
          break;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.doc = action.payload.docFiles;
        state.txt = action.payload.txtFiles;
        state.csvExcel = action.payload.csvExcelFiles;
        state.pdf = action.payload.pdfFiles;
        state.apk = action.payload.apkFile;
        state.zip = action.payload.zipFiles;
        state.loading = false;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  },
});
export const {
  sortByOption,
} = documentSlice.actions;
export const selectDocument = (state: RootState) => state.documentFile;

export default documentSlice.reducer;
