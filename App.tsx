import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { LogBox, Permission, PermissionsAndroid, Platform } from 'react-native';
import { Provider } from 'react-redux';
import Main from './screens/Main';
import { Text } from 'react-native-paper';
import { store } from './stores';
import { cleanOldFiles, createInAppFolder } from './utils/Constants';
import { createFolders } from './utils/ExpoFileConstant';

LogBox.ignoreLogs(['componentWillMount', 'componentWillReceiveProps']);

const App = () => {
  const [permissionsAllow, setPermissionAllow] = useState(false)
  async function requestStoragePermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([          
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE],
        );
        console.log("granted", granted);
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  }

  const setUpApp = async () => {
    const storagePermission =  await requestStoragePermission()
    setPermissionAllow(storagePermission)
    await createFolders()
  }

  useEffect(() => {
    setUpApp()
  }, [])

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
