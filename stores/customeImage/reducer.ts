import { createSlice } from '@reduxjs/toolkit';
import { fetchImageFiles, removeFileToTrash, renameFiles } from './action';
import { RootState } from '..';
import { getCategoryByExtension } from '../../utils/getFileByCategory';

export const customeImageSlice = createSlice({
  name: 'files',
  initialState: {
    file: [],
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
    sortByOption: (state, { payload }) => {
      switch (payload) {
        case 1:
          console.log("sortDocumentByOption start", new Date());
          state.file = [...state.file].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          break;
        case 2:
          state.file = state.file.sort((a, b) => a.size - b.size);
          break;
        default:
          break;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImageFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImageFiles.fulfilled, (state, action) => {
        state.file = action.payload;
        state.loading = false;
      })
      .addCase(fetchImageFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(renameFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(renameFiles.fulfilled, (state, action) => {
        const { oldPath, newPath } = action.payload;
        const fileName = newPath.split('/').pop();
        state.file = [...state.file].map((file) =>
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

        // Update the corresponding list
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
      });
  },
});
export const {
  setMultiSelect,
  setSelectAll,
  cancelMultiSelect,
} = customeImageSlice.actions;
export const selectCustomeImage = (state: RootState) => state.customeImageFile;

export default customeImageSlice.reducer;
