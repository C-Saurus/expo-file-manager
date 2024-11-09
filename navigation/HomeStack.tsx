import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { ImageScreen } from '../screens/ImageScreen';
import { VideoScreen } from '../screens/VideoScreen';
import VideoPlayer from '../screens/VideoPlayer';
import Browser from '../screens/Browser';
import LargeFilesScanner from '../screens/ScanLargeFile';
import { Home } from '../screens/Home';
import PDFScreen from '../screens/PDFScreen';

const HomeStack = createStackNavigator();

export const HomeStackNavigator1: React.FC = () => {
  return (
    <HomeStack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeMain" component={Home} />
      <HomeStack.Screen
        name="LargeFilesScanner"
        component={LargeFilesScanner}
      />
      <HomeStack.Screen
        name="PDFScreen"
        component={PDFScreen}
      />
      <HomeStack.Screen name="ImageScreen" component={ImageScreen} />
      <HomeStack.Screen name="VideoScreen" component={VideoScreen} />
      <HomeStack.Screen
        name="VideoPlayer"
        options={({ route }) => ({
          title: 'Video',
          presentation: 'transparentModal',
        })}
        component={VideoPlayer}
      />
      <HomeStack.Screen
        name="Browser"
        options={({ route }) => ({
          title: 'File Manager',
        })}
        component={Browser}
      />
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator1;
