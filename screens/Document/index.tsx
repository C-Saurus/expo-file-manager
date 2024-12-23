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
import {
  cancelMultiSelect,
  setSelectAll,
  sortCsvExcelByOption,
  sortDocumentByOption,
  sortTxtByOption,
} from '../../stores/document/reducer';
import { styles } from './style';
import { DisplayOptionModal } from '../../components/Modals/DisplayOptionModal';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DocumentScreen: React.FC<any> = React.memo(({ navigation }) => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false);
  const [openOption, setOpenOption] = useState(false);
  const [index, setIndex] = useState(0); // Tab index
  const [routes] = useState([
    { key: 'doc', title: 'Doc' },
    //{ key: 'txt', title: 'TXT' },
    { key: 'sheet', title: 'CSV/Excel' },
  ]);
  const { colors } = useAppSelector((state) => state.theme.theme);
  const {
    doc,
    txt,
    loading,
    isMultiSelect,
    selectAll,
    selectedFile,
    currentSelectFileType,
  } = useAppSelector((state) => ({
    doc: state.documentFile.doc,
    txt: state.documentFile.txt,
    loading: state.documentFile.loading,
    isMultiSelect: state.documentFile.isMultiSelect,
    selectAll: state.documentFile.selectAll,
    selectedFile: state.documentFile.selectedFile,
    currentSelectFileType: state.documentFile.currentSelectFileType,
  }));
  const fileMap = {
    doc: doc,
    txt: txt,
  };

  const layout = useWindowDimensions();
  const { top } = useSafeAreaInsets();

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
        //case 'txt':
          //return <TabDocFiles data={txt} />;
        case 'sheet':
          return <TabDocFiles data={txt} />;
        default:
          return null;
      }
    },
    [doc, txt]
  );

  const handleSort = (value) => {
    switch (index) {
      case 0:
        dispatch(sortDocumentByOption(value));
        break;
      case 1:
        dispatch(sortTxtByOption(value));
        break;
      case 1:
        dispatch(sortCsvExcelByOption(value));
        break;
      default:
        break;
    }
    setOpenOption(false);
  };

  const renderTabBar = useCallback(
    (props) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: 'blue' }}
        style={{ backgroundColor: 'white' }}
        activeColor="blue"
        inactiveColor="gray"
      />
    ),
    []
  );

  const handleSelectAll = () => {
    dispatch(setSelectAll());
  };

  if (loading) {
    return (
      <View
        style={{
          ...styles.container,
          backgroundColor: colors.background2,
          width: '100%',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1}}>
      {isMultiSelect && currentSelectFileType && (
        <View style={[styles.nav, { top: top - useHeaderHeight() + 10 }]}>
          <View style={styles.navFirst}>
            <Text style={styles.count}>
              {selectedFile.length} / {fileMap[currentSelectFileType]?.length}
            </Text>
            <Text style={styles.count}>Multiple Select</Text>
            <TouchableOpacity onPress={() => dispatch(cancelMultiSelect())}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.line}></View>
          <View style={styles.navFirst}>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="file-move-outline"
                size={24}
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="copy-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSelectAll}>
              <Feather
                style={{ marginLeft: 10 }}
                name={selectAll ? 'check-square' : 'square'}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <TabView
        lazy={true}
        swipeEnabled={!isMultiSelect}
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
