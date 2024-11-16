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
import { DocScanner } from '../screens/DocScanner';

const HomeStack = createStackNavigator();


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
        name="DocScanner"
        component={DocScanner}
      />
      <HomeStack.Screen name="PDFScreen" component={PDFScreen} />
      <HomeStack.Screen
        name="ImageScreen"
        component={ImageScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <HomeStack.Screen name="VideoScreen" component={VideoScreen} />
      <HomeStack.Screen
        name="VideoPlayer"
        options={({ route }) => ({
          title: 'Video',
          headerShown: false,
          presentation: 'transparentModal',
        })}
        component={VideoPlayer}
      />
      <HomeStack.Screen name="AudioScreen" component={AudioScreen} />
      <HomeStack.Screen
        name="AudioPlayer"
        options={({ route }) => ({
          title: 'Audio',
          headerShown: false,
          presentation: 'transparentModal',
        })}
        component={AudioPlayer}
      />
      <HomeStack.Screen
        name="Browser"
        options={({ route }) => ({
          title: 'File Manager',
        })}
        component={Browser}
      />
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
