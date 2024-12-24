import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { ImageScreen } from '../screens/ImageScreen';
import VideoPlayer from '../screens/VideoPlayer';
import Browser from '../screens/Browser';
import LargeFilesScanner from '../screens/ScanLargeFile';
import { Home } from '../screens/Home';
import PDFScreen from '../screens/PDFScreen';
import MiscFileView from '../screens/MiscFileView';
import AudioPlayer from '../screens/Audio/details';
import { DocumentScreen } from '../screens/Document';
import { DocScanner } from '../screens/DocScanner';
import TrashScreen from '../screens/Trash';
import ApkScreen from '../screens/Apk';
import ZipScreen from '../screens/Zip';
import TxtScreen from '../screens/Txt';
import ImageGalleryView from '../screens/ImageGalleryView';
import AIFileSummarize from '../screens/AIFileAssume';

type HomeStackParamList = {
  HomeMain: any;
  TrashScreen: any;
  PDFScreen: any;
  ApkScreen: any;
  ZipScreen: any;
  VideoPlayer: any;
  AudioPlayer: any;
  DocScanner: any;
  DocumentScreen: any;
  TxtScreen: any;
  MiscFileView: any;
  ImageGalleryView: any;
  ImageScreen: { fileType: string };
  LargeFilesScanner: { mode: number };
  AIFileSummarize: { filePath: string };
};

const HomeStack = createStackNavigator<HomeStackParamList>();

export const HomeStackNavigator1: React.FC = () => {
  return (
    <HomeStack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: true,
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
      <HomeStack.Screen
        name="LargeFilesScanner"
        options={({ route }) => ({
          title:
            route.params.mode === 0
              ? 'Tệp tin lớn'
              : 'Tệp trùng lặp',
          animationTypeForReplace: 'pop',
        })}
        component={LargeFilesScanner}
      />
      <HomeStack.Screen 
        name="TrashScreen" 
        component={TrashScreen} />
      <HomeStack.Screen 
        name="DocScanner"
        options={({ route }) => ({
          headerShown: false,
          presentation: 'transparentModal',
        })}
        component={DocScanner} />
      <HomeStack.Screen
        name="PDFScreen"
        options={({ route }) => ({
          headerShown: false,
          presentation: 'transparentModal',
        })}
        component={PDFScreen}
      />
      <HomeStack.Screen
        name="ApkScreen"
        options={({ route }) => ({
          headerShown: false,
          presentation: 'transparentModal',
        })}
        component={ApkScreen}
      />
      <HomeStack.Screen
        name="ZipScreen"
        options={({ route }) => ({
          headerShown: false,
          presentation: 'transparentModal',
        })}
        component={ZipScreen}
      />
      <HomeStack.Screen
        name="TxtScreen"
        options={({ route }) => ({
          headerShown: false,
          presentation: 'transparentModal',
        })}
        component={TxtScreen}
      />
      <HomeStack.Screen
        name="ImageScreen"
        component={ImageScreen}
        options={({ route }) => ({
          headerShown: false,
          title:
            route.params.fileType === 'video'
              ? 'Video'
              : route.params.fileType === 'audio'
              ? 'Audio'
              : 'Image',
          animationTypeForReplace: 'pop',
        })}
      />
      <HomeStack.Screen
        name="VideoPlayer"
        options={({ route }) => ({
          headerShown: false,
          presentation: 'transparentModal',
        })}
        component={VideoPlayer}
      />

      <HomeStack.Screen
        name="AudioPlayer"
        options={({ route }) => ({
          title: 'Audio',
          presentation: 'transparentModal',
        })}
        component={AudioPlayer}
      />
      <HomeStack.Screen
        name="ImageGalleryView"
        options={({ route }) => ({
          headerShown: false,
          title: route?.params?.prevDir.split('/').pop() || 'Gallery',
          presentation: 'transparentModal',
        })}
        component={ImageGalleryView}
      />
      <HomeStack.Screen
        name="DocumentScreen"
        options={({ route }) => ({
          headerShown: false,
          presentation: 'transparentModal',
        })}
        component={DocumentScreen}
      />
      <HomeStack.Screen
        name="MiscFileView"
        options={({ route }) => ({
          title: 'File View',
          presentation: 'transparentModal',
        })}
        component={MiscFileView}
      />
      <HomeStack.Screen
        name="AIFileSummarize"
        component={AIFileSummarize}
        options={({ route }) => ({
          title: 'File Summarize',
          presentation: 'transparentModal',
        })}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator1;
