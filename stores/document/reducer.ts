import { createSlice } from '@reduxjs/toolkit';
import { fetchFiles, removeFileToTrash, renameFiles } from './action';
import { RootState } from '..';
import { getCategoryByExtension } from '../../utils/getFileByCategory';

export const documentSlice = createSlice({
  name: 'files',
  initialState: {
    docFiles: [],
    txtFiles: [],
    csvExcelFiles: [],
    otherFiles: [],
    pdfFiles: [],
    zipFiles: [],
    apkFile: [],
    loading: false,
    error: null,
  },
  reducers: {
    sortDocumentByOption: (state, { payload }) => {
      switch(payload) {
        case 1:
          state.docFiles = state.docFiles.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 2:
          state.docFiles = state.docFiles.sort((a, b) => a.size - b.size);
          break;
        default:
          break;
      }
    },
    sortTxtByOption: (state, { payload }) => {
      switch(payload) {
        case 1:
          state.txtFiles = state.txtFiles.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 2:
          state.txtFiles = state.txtFiles.sort((a, b) => a.size - b.size);
          break;
        default:
          break;
      }
    },
    sortCsvExcelByOption: (state, { payload }) => {
      switch(payload) {
        case 1:
          state.csvExcelFiles = state.csvExcelFiles.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 2:
          state.csvExcelFiles = state.csvExcelFiles.sort((a, b) => a.size - b.size);
          break;
        default:
          break;
      }
    },
    sortPdfByOption: (state, { payload }) => {
      switch(payload) {
        case 1:
          state.pdfFiles = state.pdfFiles.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 2:
          state.pdfFiles = state.pdfFiles.sort((a, b) => a.size - b.size);
          break;
        default:
          break;
      }
    },
    sortApkByOption: (state, { payload }) => {
      switch(payload) {
        case 1:
          state.apkFile = state.apkFile.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 2:
          state.apkFile = state.apkFile.sort((a, b) => a.size - b.size);
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
        state.loading = false;
        state.docFiles = action.payload.docFiles;
        state.txtFiles = action.payload.txtFiles;
        state.csvExcelFiles = action.payload.csvExcelFiles;
        state.otherFiles = action.payload.otherFiles;
        state.pdfFiles = action.payload.pdfFiles;
        state.apkFile = action.payload.apkFile;
        state.zipFiles = action.payload.zipFiles;
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
        const { oldPath, newPath } = action.payload;
        const ext = newPath.split('.').pop();
        const category = getCategoryByExtension(ext);
        const fileName = newPath.split('/').pop();

        // Update the corresponding list
        if (category === 'doc') {
          state.docFiles = state.docFiles.map((file) =>
            file.path === oldPath
              ? { ...file, path: newPath, name: fileName }
              : file
          );
        } else if (category === 'txt') {
          state.txtFiles = state.txtFiles.map((file) =>
            file.path === oldPath
              ? { ...file, path: newPath, name: fileName }
              : file
          );
        } else if (category === 'csvExcel') {
          state.csvExcelFiles = state.csvExcelFiles.map((file) =>
            file.path === oldPath
              ? { ...file, path: newPath, name: fileName }
              : file
          );
        } else if (category === 'pdf') {
          state.csvExcelFiles = state.pdfFiles.map((file) =>
            file.path === oldPath
              ? { ...file, path: newPath, name: fileName }
              : file
          );
        } else if (category === 'zip') {
          state.zipFiles = state.csvExcelFiles.map((file) =>
            file.path === oldPath
              ? { ...file, path: newPath, name: fileName }
              : file
          );
        } else if (category === 'app') {
          state.apkFile = state.csvExcelFiles.map((file) =>
            file.path === oldPath
              ? { ...file, path: newPath, name: fileName }
              : file
          );
        } else {
          state.otherFiles = state.otherFiles.map((file) =>
            file.path === oldPath
              ? { ...file, path: newPath, name: fileName }
              : file
          );
        }
      })
      .addCase(renameFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(removeFileToTrash.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFileToTrash.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action);
        const { filestoBeDeletedRes, fileType } = action.payload;
        const category = getCategoryByExtension(fileType);

        // Update the corresponding list
        if (category === 'doc') {
          state.docFiles = state.docFiles.filter(
            (file) =>
              filestoBeDeletedRes.findIndex(
                (fileDeleted) => fileDeleted.oldPath === file.path
              ) === -1
          );
        } else if (category === 'txt') {
          state.txtFiles = state.txtFiles.map(
            (file) =>
              filestoBeDeletedRes.findIndex(
                (fileDeleted) => fileDeleted.oldPath === file.path
              ) === -1
          );
        } else if (category === 'csvExcel') {
          state.csvExcelFiles = state.csvExcelFiles.map(
            (file) =>
              filestoBeDeletedRes.findIndex(
                (fileDeleted) => fileDeleted.oldPath === file.path
              ) === -1
          );
        } else if (category === 'pdf') {
          state.csvExcelFiles = state.pdfFiles.map(
            (file) =>
              filestoBeDeletedRes.findIndex(
                (fileDeleted) => fileDeleted.oldPath === file.path
              ) === -1
          );
        } else if (category === 'zip') {
          state.zipFiles = state.csvExcelFiles.map(
            (file) =>
              filestoBeDeletedRes.findIndex(
                (fileDeleted) => fileDeleted.oldPath === file.path
              ) === -1
          );
        } else if (category === 'app') {
          state.apkFile = state.csvExcelFiles.map(
            (file) =>
              filestoBeDeletedRes.findIndex(
                (fileDeleted) => fileDeleted.oldPath === file.path
              ) === -1
          );
        } else {
          state.otherFiles = state.otherFiles.map(
            (file) =>
              filestoBeDeletedRes.findIndex(
                (fileDeleted) => fileDeleted.oldPath === file.path
              ) === -1
          );
        }
      })
      .addCase(removeFileToTrash.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export const { sortDocumentByOption, sortTxtByOption, sortCsvExcelByOption, sortPdfByOption, sortApkByOption } = documentSlice.actions;
export const selectDocument = (state: RootState) => state.documentFile;

export default documentSlice.reducer;
