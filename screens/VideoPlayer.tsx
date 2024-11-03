import { StyleSheet } from 'react-native';
import React, { useRef } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useAppSelector } from '../hooks/reduxHooks';
import { ResizeMode, Video } from 'expo-av';
import Constants from 'expo-constants';
import { SIZE } from '../utils/Constants';
import { SafeAreaView } from 'react-native-safe-area-context';

type VideoViewParamList = {
  VideoPlayer: { prevDir?: string; folderName?: string; uriValue?: string };
};

type Props = StackScreenProps<VideoViewParamList, 'VideoPlayer'>;

export default function VideoPlayer({ route }: Props) {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { prevDir, folderName, uriValue } = route.params;
  const videoRef = useRef<Video | null>(null);
  console.log("prevDir + folderName + uriValue", prevDir + folderName + uriValue)
  return (
    <SafeAreaView
      style={{ ...styles.container, backgroundColor: colors.background }}
    >
      <Video
        ref={videoRef}
        style={{
          width: SIZE,
          height: '100%',
        }}
        source={{
          uri: prevDir + folderName + uriValue,
        }}
        useNativeControls
        shouldPlay
        resizeMode={ResizeMode.COVER}
        isLooping
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
