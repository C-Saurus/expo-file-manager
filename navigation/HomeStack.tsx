import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { Home } from '../screens/Home/Main';
import LargeFilesScanner from '../screens/Home/ScanLargeFile';

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
    </HomeStack.Navigator>
  );
};

export default HomeStackNavigator1;
