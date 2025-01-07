import { configureStore } from "@reduxjs/toolkit";
import imagesSlice from "../features/files/imagesSlice";
import themeSlice from "../features/files/themeSlice";
import snackbarSlice from "../features/files/snackbarSlice";
import tabbarStyleSlice from "../features/files/tabbarStyleSlice";
import documentSlice from "./document/reducer";


export const store = configureStore({
  reducer: {
    images: imagesSlice,
    theme: themeSlice,
    snackbar: snackbarSlice,
    tabbarStyle: tabbarStyleSlice,
    documentFile: documentSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
