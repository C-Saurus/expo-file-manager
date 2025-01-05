import React, { useEffect, useRef } from 'react';
import { LogBox, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

import { MainNavigator } from '../navigation/MainNavigator';

import useColorScheme from '../hooks/useColorScheme';
import useLock from '../hooks/useLock';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { setLightTheme, setDarkTheme } from '../features/files/themeSlice';
import LockScreen from '../screens/LockScreen';
import Toast from 'react-native-toast-message';
import { fetchFiles } from '../stores/document/action';

SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  'VirtualizedLists should never',
  'supplied to `DialogInput`',
]);

export default function Main() {
  const hasFetchFile = useRef(false);
  const { locked, setLocked, lockType } = useLock();
  const { theme } = useAppSelector((state) => state.theme);
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("lockkkkkkkkkkkkk", locked)
    if (hasFetchFile.current || locked) return;
    dispatch(fetchFiles());
    hasFetchFile.current = true;
  }, [locked, dispatch]);

  useEffect(() => {
    const setColorScheme = async () => {
      const storedScheme = await AsyncStorage.getItem('colorScheme');
      if (!storedScheme) {
        await AsyncStorage.setItem('colorScheme', colorScheme);
        dispatch(colorScheme === 'dark' ? setDarkTheme() : setLightTheme());
      } else {
        dispatch(storedScheme === 'dark' ? setDarkTheme() : setLightTheme());
      }
    };
    setColorScheme();
  }, []);

  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 1000)
    }
  }, [fontsLoaded]);

  if (locked) {
    return <LockScreen setLocked={setLocked} lockType={lockType} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <NavigationContainer theme={theme.dark ? DarkTheme : DefaultTheme}>
        <MainNavigator />
      </NavigationContainer>
      <Toast position="bottom" autoHide visibilityTime={3000} bottomOffset={20} />
    </View>
  );
}
