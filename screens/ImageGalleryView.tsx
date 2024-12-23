import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import ImageView from 'react-native-image-viewing';

import { StackScreenProps } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { setTabbarVisible } from '../features/files/tabbarStyleSlice';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type FileViewParamList = {
  ImageGalleryView: { prevDir: string; folderName: string; uriValue?: string };
};

type Props = StackScreenProps<FileViewParamList, 'ImageGalleryView'>;

const ImageGalleryView = ({ route }: Props) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { prevDir, folderName, uriValue } = route.params;
  const { images } = useAppSelector((state) => state.images);
  const [display, setDisplay] = useState(true);
  const initialImageIndex = useCallback(
    () =>
      images.findIndex((item) =>
      {
        console.log("item", item.uri);
        console.log("uriValue", uriValue);
        return item.uri === (prevDir ? `${prevDir}/${folderName}}` : uriValue)
      }
      ),
    []
  );

  useEffect(() => {
    dispatch(setTabbarVisible(false));

    return () => {
      dispatch(setTabbarVisible(true));
    };
  }, []);
  return (
    <Pressable style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ ...styles.container }}>
        <ImageView
          images={images}
          imageIndex={initialImageIndex()}
          visible={true}
          onRequestClose={() => navigation.goBack()}
          keyExtractor={(_, index) => index.toString()}
          doubleTapToZoomEnabled
          swipeToCloseEnabled
        />
        {/* <View
          style={[styles.bottomBar, { display: display ? 'flex' : 'none' }]}
        >
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <MaterialIcons name="edit" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="share-social-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="trash-outline" size={24} color="white" />
          </TouchableOpacity>
        </View> */}
      </View>
    </Pressable>
  );
};

export default ImageGalleryView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ phía dưới
    padding: 10,
  },
});
