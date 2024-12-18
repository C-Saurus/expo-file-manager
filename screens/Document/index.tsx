import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  setSelectAll,
  sortCsvExcelByOption,
  sortDocumentByOption,
  sortTxtByOption,
} from '../../stores/document/reducer';
import { styles } from './style';
import { DisplayOptionModal } from '../../components/Modals/DisplayOptionModal';

export const DocumentScreen: React.FC<any> = React.memo(({ navigation }) => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false);
  const [openOption, setOpenOption] = useState(false);
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { docFiles, txtFiles, loading, isMultiSelect, selectAll, error } = useAppSelector(
    (state) => state.documentFile
  );
  const layout = useWindowDimensions();

  const handleChooseOption = () => {
    setOpenOption(!openOption);
  };

  useEffect(() => {
    // Cập nhật headerRight khi màn hình này được render
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleChooseOption}>
          <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: {
        marginRight: 15,
      },
    });
  }, [navigation, openOption]);

  useEffect(() => {
    if (hasFetchFile.current) return;
    if (!docFiles.length && !hasFetchFile.current) {
      dispatch(fetchFiles());
      hasFetchFile.current = true;
    }
  }, [dispatch, docFiles]);

  const renderScene = useCallback(({ route }) => {
    switch (route.key) {
      case 'doc':
        return <TabDocFiles data={docFiles} selectAll={selectAll} />;
      case 'txt':
        return <TabDocFiles data={txtFiles} selectAll={selectAll} />;
      case 'sheet':
        return <TabDocFiles data={txtFiles} selectAll={selectAll} />;
      default:
        return null;
    }
  }, [docFiles, txtFiles]);

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

  const [index, setIndex] = useState(0); // Tab index
  const [routes] = useState([
    { key: 'doc', title: 'DOC' },
    { key: 'txt', title: 'TXT' },
    { key: 'sheet', title: 'CSV/Excel' },
  ]);

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
    dispatch(setSelectAll({payload: true, type: ''}))
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
    <>
      {!isMultiSelect && (
        <View style={styles.nav}>
          <Text style={styles.count}>12/12</Text>
          <TouchableOpacity onPress={handleSelectAll}>
            <Feather
              style={{ marginLeft: 10 }}
              name={selectAll ? 'check-square' : 'square'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
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
    </>
  );
});
