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
    image: [],
    video: [],
    audio: [],
    isMultiSelect: false,
    selectAll: false,
    selectedFile: [],
    currentSelectFileType: undefined,
    loading: false,
    error: null,
  },
  reducers: {
    setMultiSelect: (state, { payload }) => {
      const ext = payload.split('.').pop();
      const category = getCategoryByExtension(ext);
      console.log("currentSelectFileType", state.currentSelectFileType);
      console.log("isMultiSelect", new Date());
      if (!state.currentSelectFileType) {
        state.currentSelectFileType = category
      }
      if (state.isMultiSelect) {
        const fileIndex = state.selectedFile.findIndex((item) => item.path === payload);
        if (fileIndex !== -1) {
          // Xóa file nếu đã tồn tại
          state.selectedFile.splice(fileIndex, 1);
        } else {
          // Thêm file nếu chưa tồn tại
          state.selectedFile = [...state.selectedFile, payload];
        }
      } else {
        console.log("COME");
        state.isMultiSelect = true
        state.selectedFile = [payload];
        console.log("currentSelectFileType", state.currentSelectFileType);
        console.log("isMultiSelect", state.isMultiSelect);
      }

    },
    setSelectAll: (state) => {
      if (state.isMultiSelect) {
        state.selectedFile = state[state.currentSelectFileType]
      }
    },
    cancelMultiSelect: (state) => {
      if (state.isMultiSelect) {
        state.selectAll = false
        state.selectedFile = []
        state.currentSelectFileType = undefined
      }
      state.isMultiSelect = false
    },
    sortDocumentByOption: (state, { payload }) => {
      switch (payload) {
        case 1:
          console.log("sortDocumentByOption start", new Date());
          state.doc = [...state.doc].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          console.log("sortDocumentByOption end", new Date());
          break;
        case 2:
          state.doc = state.doc.sort((a, b) => a.size - b.size);
          break;
        default:
          break;
      }
    },
    sortTxtByOption: (state, { payload }) => {
      switch (payload) {
        case 1:
          state.txt = state.txt.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          break;
        case 2:
          state.txt = state.txt.sort((a, b) => a.size - b.size);
          break;
        default:
          break;
      }
    },
    sortCsvExcelByOption: (state, { payload }) => {
      switch (payload) {
        case 1:
          state.csvExcel = state.csvExcel.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          break;
        case 2:
          state.csvExcel = state.csvExcel.sort(
            (a, b) => a.size - b.size
          );
          break;
        default:
          break;
      }
    },
    sortPdfByOption: (state, { payload }) => {
      switch (payload) {
        case 1:
          state.pdf = state.pdf.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          break;
        case 2:
          state.pdf = state.pdf.sort((a, b) => a.size - b.size);
          break;
        default:
          break;
      }
    },
    sortApkByOption: (state, { payload }) => {
      switch (payload) {
        case 1:
          state.apk = state.apk.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          break;
        case 2:
          state.apk = state.apk.sort((a, b) => a.size - b.size);
          break;
        default:
          break;
      }
    },
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
        state.image = action.payload.imageFile;
        state.video = action.payload.videoFile;
        state.audio = action.payload.audioFile;
        state.loading = false;
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
        const { oldPath, newPath } = action.payload;
        const ext = newPath.split('.').pop();
        const category = getCategoryByExtension(ext);
        const fileName = newPath.split('/').pop();
        state[category] = [...state[category]].map((file) =>
          file.path === oldPath
            ? { ...file, path: newPath, name: fileName }
            : file
        );
        state.loading = false;
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

        state[category] = [...state[category]].filter(
          (file) =>
            filestoBeDeletedRes.findIndex(
              (fileDeleted) => fileDeleted.oldPath === file.path
            ) === -1
        );
      })
      .addCase(removeFileToTrash.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(moveFileToCustomeFolderRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveFileToCustomeFolderRequest.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action);
        const { filestoBeDeletedRes, folder } = action.payload;
        const category = getCategoryByExtension(folder);

        state[category] = [...state[category]].filter(
          (file) =>
            filestoBeDeletedRes.findIndex(
              (fileDeleted) => fileDeleted.oldPath === file.path
            ) === -1
        );
      })
      .addCase(moveFileToCustomeFolderRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export const {
  setMultiSelect,
  setSelectAll,
  cancelMultiSelect,
  sortDocumentByOption,
  sortTxtByOption,
  sortCsvExcelByOption,
  sortPdfByOption,
  sortApkByOption,
} = documentSlice.actions;
export const selectDocument = (state: RootState) => state.documentFile;

export default documentSlice.reducer;
