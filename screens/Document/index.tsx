import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { FlatList } from 'react-native-gesture-handler';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import {
  fetchFiles,
  removeFileToTrash,
  renameFiles,
} from '../../stores/document/action';
import { ReadDirItem } from 'react-native-fs';
import { ActivityIndicator } from 'react-native-paper';
import FileItemCommon from '../../components/Browser/Files/FileItemCommon';
import {
  setSnack,
  snackActionPayload,
} from '../../features/files/snackbarSlice';
import useNewSelectionChange from '../../hooks/newUseSelectedChange';
import { ProgressDialog } from 'react-native-simple-dialogs';
import { DownloadDialog } from '../../components/Browser/DownloadDialog';
import Dialog from 'react-native-dialog';
import axios, { AxiosError } from 'axios';
import moment from 'moment';
import * as mime from 'react-native-mime-types';
import { TRASH_FOLDER } from '../../utils/Constants';
import RNFS from 'react-native-fs';
import { TabDocFiles } from './list';
import { sortCsvExcelByOption, sortDocumentByOption, sortTxtByOption } from '../../stores/document/reducer';

export const DocumentScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false);
  const [openOption, setOpenOption] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { docFiles, loading, error } = useAppSelector(
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

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'doc':
        return (
          <TabDocFiles
            fileType="doc"
            selectAll={selectAll}
          />
        );
      case 'txt':
        return (
          <TabDocFiles
            fileType="text"
            selectAll={selectAll}
          />
        );
      case 'csvExcel':
        return (
          <TabDocFiles
            fileType="excel"
            selectAll={selectAll}
          />
        );
      default:
        return null;
    }
  };

  const handleSort = (value) => {
    switch(index) {
      case 0:
        dispatch(sortDocumentByOption(value))
        break;
      case 1:
        dispatch(sortTxtByOption(value))
        break;
      case 2:
          dispatch(sortCsvExcelByOption(value))
          break; 
      default:
        break
    }
    setOpenOption(false);
  }

  const [index, setIndex] = useState(0); // Tab index
  const [routes] = useState([
    { key: 'doc', title: 'DOC' },
    { key: 'txt', title: 'TXT' },
    { key: 'csvExcel', title: 'CSV/Excel' },
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
      <TabView
        lazy={true}
        lazyPreloadDistance={1}
        renderTabBar={renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={openOption}
        onRequestClose={() => setOpenOption(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpenOption(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              delayPressIn={0}
              style={styles.modalItem}
              onPress={() => handleSort(1)}
            >
              <Text style={styles.modalText}>Sắp xếp theo tên</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => handleSort(2)}
            >
              <Text style={styles.modalText}>Sắp xếp theo dung lượng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => setSelectAll(!selectAll)}
            >
              <View style={styles.checkboxContainer}>
                <Ionicons
                  name={selectAll ? 'checkbox-outline' : 'square-outline'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.modalText}>Chọn tất cả</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  menuButton: {
    marginRight: 10,
  },
  overlay: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: 10, // Điều chỉnh vị trí modal so với nút header
    right: 35,
    backgroundColor: '#fff', // Màu nền modal
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5, // Tạo bóng mờ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#c7cecfdd', // Đường kẻ giữa các mục
  },
  modalText: {
    fontSize: 16,
    color: '#000', // Màu chữ trắng
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
