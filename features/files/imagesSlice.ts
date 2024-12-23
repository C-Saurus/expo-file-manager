import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../stores';

interface imagesSliceState {
  images: {uri: string}[];
}

const initialState: imagesSliceState = {
  images: [],
};

export const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    setImages: (state, action: PayloadAction<{uri: string}[]>) => {
      state.images = action.payload;
    },
  },
});

export const { setImages } = imagesSlice.actions;

export const selectImages = (state: RootState) => state.images.images;

export default imagesSlice.reducer;
