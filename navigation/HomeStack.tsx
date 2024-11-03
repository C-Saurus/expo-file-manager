import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { Home } from '../screens/Home/Main';
import LargeFilesScanner from '../screens/Home/ScanLargeFile';
import { ImageScreen } from '../screens/ImageScreen';
import { VideoScreen } from '../screens/VideoScreen';
import VideoPlayer from '../screens/VideoPlayer';

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
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator1;
