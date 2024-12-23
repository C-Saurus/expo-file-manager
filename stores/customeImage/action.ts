import { createAsyncThunk } from "@reduxjs/toolkit";
import { copyFileToCustomeFolder, getCustomeFileByFolder, moveFileToCustomeFolder, moveFileToTrash } from "../../utils/Constants";
import RNFS, { ReadDirItem } from 'react-native-fs';

export const fetchImageFiles = createAsyncThunk(
  'files/fetchImageFiles',
  async (folder: string) => {
    const files = await getCustomeFileByFolder(folder);
    return files;
  }
);

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
    { filestoBeDeleted, fileType } : { filestoBeDeleted?: ReadDirItem[], fileType: string },
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

export const moveFileToCustomeFolderRequest = createAsyncThunk(
  'files/moveFileToCustomeFolder',
  async (
    { filestoBeDeleted, fileType } : { filestoBeDeleted?: ReadDirItem[], fileType: string },
    { rejectWithValue }
  ) => {
    try {
      const promises = filestoBeDeleted.map((file) => {
        return moveFileToCustomeFolder(file.path, fileType)
      });

      const filestoBeDeletedRes = await Promise.all(promises);
      return {filestoBeDeletedRes, fileType}
    } catch (error) {
      console.log("[ERR]", error)
      rejectWithValue(error);
    }
  }
);

export const copyFileToCustomeFolderRequest = createAsyncThunk(
  'files/copyFileToCustomeFolder',
  async (
    { filestoBeDeleted, folder } : { filestoBeDeleted?: ReadDirItem[], folder: string },
    { rejectWithValue }
  ) => {
    try {
      const promises = filestoBeDeleted.map((file) => {
        return copyFileToCustomeFolder(file.path, folder)
      });

      const filestoBeDeletedRes = await Promise.all(promises);
      return {filestoBeDeletedRes, folder}
    } catch (error) {
      console.log("[ERR]", error)
      rejectWithValue(error);
    }
  }
);