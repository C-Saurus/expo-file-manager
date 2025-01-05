import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { LogBox, NativeModules, Permission, PermissionsAndroid, Platform } from 'react-native';
import { Provider } from 'react-redux';
import Main from './screens/Main';
import { Text } from 'react-native-paper';
import { store } from './stores';
import { cleanOldFiles, createInAppFolder } from './utils/Constants';
import { createFolders } from './utils/ExpoFileConstant';

LogBox.ignoreLogs(['componentWillMount', 'componentWillReceiveProps']);

const App = () => {
  const [permissionsAllow, setPermissionAllow] = useState(false)
  const [manageFileAllow, setManageFileAllow] = useState(false)

  async function requestStoragePermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([          
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE],
        );
        console.log("granded", granted)
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  }

  const handleOpenSettings = () => {
    const { IntentLauncherModules } = NativeModules;
    if (Platform.OS === 'android') {
      try {
        IntentLauncherModules.openManageAllFilesAccess();
        setManageFileAllow(true)
      } catch (error) {
        console.error('Error opening settings:', error);
      }
    } else {
      console.warn('This functionality is only available on Android');
    }
  };

  const setUpApp = async () => {
    const storagePermission =  await requestStoragePermission()
    if (!manageFileAllow) {
      handleOpenSettings()
    }
    setPermissionAllow(storagePermission)
    await createFolders()
  }

  useEffect(() => {
    setUpApp()
  }, [manageFileAllow])

  useEffect(() => {
    const clearFileTrashInterval = setInterval(() => {
      console.log('Checking for old files to delete...');
      cleanOldFiles();
    }, 24 * 60 * 60 * 1000);
    return (() => {
      clearInterval(clearFileTrashInterval)
    })
  }, []);

  return (
    <Provider store={store}>
      {
        permissionsAllow ? <Main /> : <Text>Allow Please</Text>
      }
    </Provider>
  );
};

export default App;
