import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { fetchFiles } from '../../stores/document/action';
import { ActivityIndicator } from 'react-native-paper';
import { TabDocFiles } from './list';
import { sortByOption } from '../../stores/document/reducer';
import { styles } from './style';
import { DisplayOptionModal } from '../../components/Modals/DisplayOptionModal';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { SIZE } from '../../utils/Constants';

export const DocumentScreen: React.FC<any> = React.memo(({ navigation }) => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false);
  const [openOption, setOpenOption] = useState(false);
  const [index, setIndex] = useState(0);
  const { top } = useSafeAreaInsets();
  const [routes] = useState([
    { key: 'doc', title: 'Doc' },
    //{ key: 'txt', title: 'TXT' },
    { key: 'sheet', title: 'CSV/Excel' },
  ]);
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { doc, csvExcel, loading } = useAppSelector((state) => ({
    doc: state.documentFile.doc,
    csvExcel: state.documentFile.csvExcel,
    loading: state.documentFile.loading,
  }));

  const layout = useWindowDimensions();

  const handleChooseOption = useCallback(() => {
    setOpenOption((prev) => !prev);
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleChooseOption}>
          <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: { marginRight: 15 },
    });
  }, [navigation, handleChooseOption]);

  useEffect(() => {
    if (hasFetchFile.current) return;
    if (!doc.length && !hasFetchFile.current) {
      dispatch(fetchFiles());
      hasFetchFile.current = true;
    }
  }, [dispatch, doc]);

  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case 'doc':
          return <TabDocFiles data={doc} />;
        case 'sheet':
          return <TabDocFiles data={csvExcel} />;
        default:
          return null;
      }
    },
    [doc, csvExcel]
  );

  const renderTabBar = useCallback(
    (props) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: 'blue' }}
        style={{ backgroundColor: 'white' }}
        activeColor="blue"
        inactiveColor={colors.text}
      />
    ),
    []
  );

  const handleSearch = () => {

  }

  const handleSort = (value: number) => {
    dispatch(sortByOption({ value: value, type: index ? 'csvExcel' : 'doc' }));
    setOpenOption(false);
  };

  const onBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Nếu không thể quay lại (root screen), xử lý thêm ở đây nếu cần
      console.log('Cannot go back, you are on the root screen.');
    }
  };

  return (
    <View
      style={{
        paddingTop: top,
        flex: 1,
        width: SIZE,
        backgroundColor: colors.background,
      }}
    >
      <Header
        colors={colors}
        handleChooseOption={handleChooseOption}
        headerTitle={'Document'}
        onBackPress={onBackPress}
        handleSearch={handleSearch}
      />
      <TabView
        lazy={true}
        lazyPreloadDistance={1}
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
    </View>
  );
});
