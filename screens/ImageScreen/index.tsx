import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Text,
  View,
  Alert,
  Linking,
  AlertButton,
  ActivityIndicator,
  Button,
  useWindowDimensions,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { styles } from './style';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { ExtendedAsset } from '../../types';
import { TabBar, TabView } from 'react-native-tab-view';
import { getLocalFileSize, SIZE } from '../../utils/Constants';
import MediaHeader from '../../components/Header/MediaHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setImages } from '../../features/files/imagesSlice';
import { DisplayOptionModal } from '../../components/Modals/DisplayOptionModal';
import { sortByOption } from '../../stores/document/reducer';
import { PhotosByDate } from './gridview';
import { PhotosByAlbum } from './album';

export const ImageScreen = ({ route, navigation }) => {
  const { fileType } = route.params;
  const { top } = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [isMediaGranted, setIsMediaGranted] = useState<boolean | null>(null);
  const [openOption, setOpenOption] = useState(false);
  const [viewMode, setViewMode] = useState(0);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [endCursor, setEndCursor] = useState<string>('');
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [assets, setAssets] = useState<ExtendedAsset[]>([]);

  const [routes] = useState([
    { key: 'first', title: 'All' },
    { key: 'second', title: 'Your Album' },
  ]);

  useEffect(() => {
    const requestMediaPermission = async () => {
      MediaLibrary.requestPermissionsAsync()
        .then((result) => {
          setIsMediaGranted(result.granted);
          if (!result.granted || result.accessPrivileges === 'limited') {
            const alertOptions: AlertButton[] = [
              {
                text: 'Go to App Settings',
                onPress: () => {
                  Linking.openSettings();
                },
              },
              {
                text: 'Nevermind',
                onPress: () => {},
                style: 'cancel',
              },
            ];
            if (result.canAskAgain && result.accessPrivileges !== 'limited')
              alertOptions.push({
                text: 'Request again',
                onPress: () => requestMediaPermission(),
              });
            Alert.alert(
              'Denied Media Access',
              'App needs access to all media library',
              [...alertOptions]
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };
    requestMediaPermission();
  }, []);

  async function getAlbumAssets(after?: string) {
    if (loading) return;
    console.log('Fetching assets...');
    setLoading(true);
    const options = {
      first: 20,
      sortBy: MediaLibrary.SortBy.creationTime,
      mediaType: MediaLibrary.MediaType[fileType],
    };
    if (after) options['after'] = after;
    const albumAssets = await MediaLibrary.getAssetsAsync(options);
    const newAssest = albumAssets.assets.map((asset) => {
      return {
        ...asset,
        selected: false,
      };
    });
    setAssets((prev) => [...prev, ...newAssest]);
    setHasNextPage(albumAssets.hasNextPage);
    setEndCursor(albumAssets.endCursor);
  }

  useEffect(() => {
    console.log('Photo');
    getAlbumAssets();
    return () => {
      setAssets([]);
    };
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      dispatch(
        setImages(
          assets.map((item) => {
            return {
              uri: item.uri,
            };
          })
        )
      );
    }
  }, [assets]);

  const getAlbumAssetsFromChild = () => {
    if (hasNextPage) {
      getAlbumAssets(endCursor);
    }
  };

  const handleChooseMode = () => {
    if (viewMode === 0) {
      setViewMode(1);
    } else {
      setViewMode(0);
    }
  };

  const handleSearch = (value: string) => {
    setAssets((prev) =>
      prev.filter((asset) => asset.name.includes(value.toLowerCase()))
    );
  };

  const onBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.log('Cannot go back, you are on the root screen.');
    }
  };

  const handleSort = (value: number) => {
    dispatch(
      sortByOption({
        value: value,
        type: fileType === 'photo' ? 'image' : fileType,
      })
    );
    setOpenOption(false);
  };

  const layout = useWindowDimensions();

  if (!isMediaGranted && isMediaGranted !== null)
    return (
      <View
        style={{
          ...styles.noAccessContainer,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ ...styles.noAccessText, color: colors.primary }}>
          {'Media Access Denied'}
        </Text>
        <Button title="Go to Settings" onPress={() => Linking.openSettings()} />
      </View>
    );

  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case 'first':
          return (
            <PhotosByDate
              fileType={fileType}
              viewMode={viewMode}
              assets={assets}
              setAssets={setAssets}
              setLoading={setLoading}
              getAlbumAssets={getAlbumAssetsFromChild}
            />
          );
        case 'second':
          return <PhotosByAlbum fileType={fileType} />;
        default:
          return null;
      }
    },
    [viewMode, fileType, assets, hasNextPage, endCursor]
  );

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: 'tomato' }}
      style={{ backgroundColor: colors.background }}
      activeColor={'tomato'}
      inactiveColor={colors.text}
    />
  );

  return (
    <View
      style={{
        paddingTop: top,
        flex: 1,
        width: SIZE,
        backgroundColor: colors.background,
      }}
    >
      <MediaHeader
        onBackPress={onBackPress}
        index={index}
        handleChooseMode={handleChooseMode}
        handleChooseOption={() => setOpenOption((prev) => !prev)}
        colors={colors}
        viewMode={viewMode}
        headerTitle={fileType}
        handleSearch={handleSearch}
      />
      <TabView
        lazy
        renderTabBar={renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
      <DisplayOptionModal
        openOption={openOption}
        setOpenOption={setOpenOption}
        handleSort={handleSort}
      />
      {loading && (
        <View
          style={{
            ...styles.overlay,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};
