import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { LogBox, Permission, PermissionsAndroid, Platform } from 'react-native';
import { Provider } from 'react-redux';
import Main from './screens/Main';
import { store } from './store';
import { Text } from 'react-native-paper';

LogBox.ignoreLogs(['componentWillMount', 'componentWillReceiveProps']);

const App = () => {
  const [permissionsAllow, setPermissionAllow] = useState(false)
  async function requestStoragePermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([          
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          'android.permission.MANAGE_EXTERNAL_STORAGE' as Permission]

        );
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  }

  const requestPermission = async () => {
    const storagePermission =  await requestStoragePermission()
    setPermissionAllow(storagePermission)
  }

  useEffect(() => {
    requestPermission()
  }, [])

  return (
    <Provider store={store}>
      {
        permissionsAllow ? <Main /> : <Text>Có cái nịt</Text>
      }
    </Provider>
  );
};

export default App;
