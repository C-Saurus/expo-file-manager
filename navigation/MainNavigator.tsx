import React from 'react';

import { Ionicons } from '@expo/vector-icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeStackNavigator from './HomeStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';

import Web from '../screens/Web';
import FileTransfer from '../screens/FileTransfer';

import { useAppSelector } from '../hooks/reduxHooks';
import HomeStackNavigator1 from './HomeStack';
import Browser from '../screens/Browser';

const Tab = createBottomTabNavigator();

export const MainNavigator: React.FC = () => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { visible } = useAppSelector((state) => state.tabbarStyle);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          display: visible ? 'flex' : 'none',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') {
            iconName = focused ? 'ios-home' : 'ios-home';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'ios-list' : 'ios-list';
          } else if (route.name === 'Downloads') {
            iconName = 'ios-cloud-download';
          } else if (route.name === 'My Folder') {
            iconName = 'browsers-outline';
          } else if (route.name === 'Web') {
            iconName = 'ios-globe';
          } else if (route.name === 'Test') {
            iconName = focused ? 'ios-home' : 'ios-home';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveBackgroundColor: colors.background,
        tabBarInactiveBackgroundColor: colors.background,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator1} />
      <Tab.Screen name="My Folder" component={HomeStackNavigator} />
      <Tab.Screen name="Web" component={Web} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
};
