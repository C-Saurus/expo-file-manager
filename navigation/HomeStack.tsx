import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { ImageScreen } from '../screens/ImageScreen';
import { VideoScreen } from '../screens/VideoScreen';
import VideoPlayer from '../screens/VideoPlayer';
import Browser from '../screens/Browser';
import LargeFilesScanner from '../screens/ScanLargeFile';
import { Home } from '../screens/Home';
import PDFScreen from '../screens/PDFScreen';
import MiscFileView from '../screens/MiscFileView';
import { AudioScreen } from '../screens/Audio';
import AudioPlayer from '../screens/Audio/details';
import { DocumentScreen } from '../screens/Document';
import { DocScanner } from '../screens/DocScanner';
import TrashScreen from '../screens/Trash';
import ApkScreen from '../screens/Apk';
import ZipScreen from '../screens/Zip';


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
  MiscFileView: any;
  ImageScreen: { fileType: string }
  LargeFilesScanner: { mode: string }
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
        component={LargeFilesScanner}
      />
      <HomeStack.Screen
        name="TrashScreen"
        component={TrashScreen}
      />
      <HomeStack.Screen
        name="DocScanner"
        component={DocScanner}
      />
      <HomeStack.Screen name="PDFScreen" component={PDFScreen} />
      <HomeStack.Screen name="ApkScreen" component={ApkScreen} />
      <HomeStack.Screen name="ZipScreen" component={ZipScreen} />
      <HomeStack.Screen
        name="ImageScreen"
        component={ImageScreen}
        options={({ route }) => ({
          title: route.params.fileType === 'video' ? "Video" : (route.params.fileType === 'audio' ? "Audio" : "Image"),
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
      <HomeStack.Screen name="DocumentScreen" component={DocumentScreen} />
      <HomeStack.Screen
        name="MiscFileView"
        options={({ route }) => ({
          title: 'File View',
          presentation: 'transparentModal',
        })}
        component={MiscFileView}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator1;
