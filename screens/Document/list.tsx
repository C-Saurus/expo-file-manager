import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { FlatList } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { removeFileToTrash, renameFiles } from '../../stores/document/action';
import { ReadDirItem } from 'react-native-fs';
import Dialog from 'react-native-dialog';
import { styles } from './style';
import { FsFileTransferDialog } from '../../components/Browser/FsFileTransferDialog';
import { MultiSelect } from '../../components/Modals/MultiSelectModal';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import {
  copyFileToCustomeFolder,
  getCustomeFileByFolder,
  moveFileToCustomeFolder,
  moveFileToTrash,
  renameFile,
} from '../../utils/Constants';
import { DisplayOptionModal } from '../../components/Modals/DisplayOptionModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileItemCommon } from '../../components/Browser/Files/FileItemCommon';
import Toast from 'react-native-toast-message';
import { getFileByCategory } from '../../utils/getFileByCategory';

type TabDocFilesProps = {
  fileType?: string;
  searchValue?: string;
  sortOption?: number;
  setParentSortOption?: (value: boolean) => void;
};

export const TabDocFiles: React.FC<TabDocFilesProps> = React.memo(
  ({ fileType, searchValue, sortOption, setParentSortOption }) => {
    const navigation = useNavigation();
    const { top } = useSafeAreaInsets();
    const { colors } = useAppSelector((state) => state.theme.theme);
    const externalLoading = useAppSelector(
      (state) => state.documentFile.loading
    );
    const [renameDialogVisible, setRenameDialogVisible] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [renamingFile, setRenamingFile] = useState<ReadDirItem>();
    const [destinationDialogVisible, setDestinationDialogVisible] =
      useState(false);
    const [moveDir, setMoveDir] = useState('');
    const [initialSelectionDone, setInitialSelectionDone] = useState(false);
    const [moveOrCopy, setMoveOrCopy] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [multiSelect, setMultiSelect] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openOption, setOpenOption] = useState(false);
    const renameInputRef = useRef<TextInput>(null);
    const currentData = useRef<ReadDirItem[]>();
    const [files, setFiles] = useState<ReadDirItem[]>();
    const listSelected = useRef([]);
    const [selectedSize, setSelectedSize] = useState(0);

    useEffect(() => {
      if (!sortOption) return;
      handleSort(sortOption);
    }, [sortOption]);

    useEffect(() => {
      if (searchValue || searchValue === '') {
        handleSearch(searchValue);
      }
    }, [searchValue]);

    useEffect(() => {
      getFile();
      return () => {
        setFiles([]);
        currentData.current = [];
      };
    }, [fileType]);

    const getFile = useCallback(async () => {
      setLoading(true);
      const files = await getFileByCategory(fileType);
      setFiles(files);
      currentData.current = files;
      setLoading(false);
    }, [fileType]);

    const deleteSelectedFiles = useCallback(async (item?: ReadDirItem) => {
      try {
        setLoading(true);
        const deleteFile = listSelected.current.length
          ? listSelected.current
          : [item];
        console.log('deleteFile', deleteFile);
        const res = await removeFileToTrash(
          deleteFile.map((item) => {
            return item.path;
          })
        );
        currentData.current = currentData.current.filter(
          (file) => !res.includes(file.path)
        );
        setFiles(currentData.current);

        cancelMultiSelect();
      } catch (error) {
        console.error('Lỗi khi di chuyển file:', error);
      }
      setLoading(false);
    }, []);

    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Nếu không thể quay lại (root screen), xử lý thêm ở đây nếu cần
        console.log('Cannot go back, you are on the root screen.');
      }
    };

    const handleChooseOption = () => {
      setOpenOption((prev) => !prev);
    };

    const handleSort = (value: number) => {
      console.log('value', value);
      switch (value) {
        case 1:
          setFiles(files.sort((a, b) => a.name.localeCompare(b.name)));
          break;
        case 2:
          setFiles(files.sort((a, b) => b.name.localeCompare(a.name)));
          break;
        case 3:
          setFiles(files.sort((a, b) => a.size - b.size));
          break;
        case 4:
          setFiles(files.sort((a, b) => b.size - a.size));
          break;
        default:
          break;
      }
      setOpenOption(false);
      if (setParentSortOption) {
        setParentSortOption(false);
      }
    };

    const cancelMultiSelect = () => {
      setMultiSelect(false);
      setSelectAll(false);
      listSelected.current = [];
    };

    const handleMoveFile = () => {
      setMoveOrCopy('Move');
      setDestinationDialogVisible(true);
    };

    const handleDeleteFile = () => {
      console.log('COME');
      setTimeout(() => {
        Alert.alert(
          'Confirm Delete',
          `Are you sure you want to delete ${
            multiSelect ? 'selected files' : 'this file'
          }?`,
          [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'Delete',
              onPress: () => {
                deleteSelectedFiles();
              },
            },
          ]
        );
      }, 300);
    };

    const handleCopyFile = () => {
      setMoveOrCopy('Copy');
      setDestinationDialogVisible(true);
    };

    const toggleSelectAll = () => {
      if (!selectAll) {
        listSelected.current = files;
      } else {
        listSelected.current = [];
      }
      setSelectAll((prev) => !prev);
      setSelectedSize(listSelected.current.length);
    };

    const executeTransfer = async (
      selectedFiles: ReadDirItem[],
      destination: string
    ) => {
      setLoading(true)
      const transferPromises = selectedFiles.map((file) => {
        if (moveOrCopy === 'Move')
          return moveFileToCustomeFolder(file.path, destination);
        else return copyFileToCustomeFolder(file.path, destination);
      });
      const res = await Promise.all(transferPromises);
      const filesAfterDelete =
        moveOrCopy === 'Copy'
          ? files
          : files.filter((file) => !res.includes(file.path));

      setFiles(filesAfterDelete);
      currentData.current = filesAfterDelete;
      cancelMultiSelect();
      setDestinationDialogVisible(false);
      setMoveDir('');
      setMoveOrCopy('');
      setLoading(false)
    };

    const moveSelectedFiles = async (destination: string) => {
      const selectedFiles = listSelected.current;
      console.log('destination', destination.slice(7));
      const destinationFolderFiles = await getCustomeFileByFolder(
        destination.slice(7)
      );
      const conflictingFiles = selectedFiles.filter(
        (file) =>
          destinationFolderFiles.findIndex(
            (destinationFile) => destinationFile.path === file.path
          ) !== -1
      );
      const confLen = conflictingFiles.length;
      if (confLen > 0) {
        Alert.alert(
          'Conflicting Files',
          `The destination folder has ${confLen} ${
            confLen === 1 ? 'file' : 'files'
          } with the same ${confLen === 1 ? 'name' : 'names'}.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Replace the files',
              onPress: () => {
                executeTransfer(selectedFiles, destination.slice(7));
              },
              style: 'default',
            },
          ]
        );
      } else {
        executeTransfer(selectedFiles, destination.slice(7));
      }
    };

    const toggleSelect = useCallback(
      (item: ReadDirItem, multiSelect?: boolean) => {
        console.log('==toggleSelect==1');
        if (multiSelect) {
          setMultiSelect(true);
          console.log('==toggleSelect==2');
        }
        if (listSelected.current.includes(item)) {
          listSelected.current = listSelected.current.filter(
            (f) => f.path !== item.path
          );
        } else {
          listSelected.current.push(item);
        }
        setSelectedSize(listSelected.current.length);
      },
      []
    );

    const handleSearch = (value: string) => {
      const filterAsset = currentData.current.filter((asset) =>
        asset.name.includes(value.toLowerCase())
      );
      setFiles(filterAsset);
    };

    useEffect(() => {
      if (renameDialogVisible && Platform.OS === 'android') {
        setTimeout(() => {
          renameInputRef.current?.focus();
        }, 100);
      }
      if (!renameDialogVisible)
        setTimeout(() => {
          setInitialSelectionDone(false);
        }, 500);
    }, [renameDialogVisible]);

    const onRename = async () => {
      const directoryPath = renamingFile.path.substring(
        0,
        renamingFile.path.lastIndexOf('/')
      );
      const newPath = `${directoryPath}/${newFileName}`;
      console.log('newpath', newPath);
      console.log('renamingFile', renamingFile.path);
      const res = await renameFile(renamingFile.path, newPath);
      if (res) {
        currentData.current = currentData.current.map((file) => {
          if (file.path === renamingFile.path) {
            return {
              ...file,
              name: newFileName,
              path: newPath,
            };
          }
          return file;
        });
        setFiles(currentData.current);
        Toast.show({
          text1: 'Rename success!',
          type: 'success',
        });
        setRenameDialogVisible(false);
        setNewFileName(undefined);
      } else {
        Toast.show({
          text1: 'Rename failed!',
          type: 'error',
        });
      }
      setRenamingFile(undefined);
    };

    const renderFileItemDoc = ({ item }) => {
      return (
        <FileItemCommon
          key={`${item.path}`}
          item={item}
          multiSelect={multiSelect}
          selectAll={selectAll}
          toggleSelect={toggleSelect}
          setTransferDialog={setDestinationDialogVisible}
          setMoveOrCopy={setMoveOrCopy}
          setRenamingFile={setRenamingFile}
          setRenameDialogVisible={setRenameDialogVisible}
          setNewFileName={setNewFileName}
          deleteSelectedFiles={deleteSelectedFiles}
        ></FileItemCommon>
      );
    };
    const renderEmptyComponent = useCallback(
      () => (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="folder-open" size={64} color="gray" />
          <Text style={styles.emptyText}>Document file do not exist</Text>
        </View>
      ),
      []
    );

    const getItemLayout = (data, index) => ({
      length: 75, // item height
      offset: 75 * index,
      index,
    });

    if (loading || externalLoading) {
      return (
        <View
          style={{
            backgroundColor: colors.background,
            flex: 1,
            paddingTop: ['pdf', 'txt', 'zip', 'apk'].includes(fileType)
              ? top
              : 0,
          }}
        >
          {['pdf', 'txt', 'zip', 'apk'].includes(fileType) && (
            <Header
              colors={colors}
              handleChooseOption={handleChooseOption}
              headerTitle={fileType}
              onBackPress={onBackPress}
              handleSearch={handleSearch}
            />
          )}
          <View
            style={{
              ...styles.container,
              backgroundColor: colors.background,
              width: '100%',
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      );
    }

    return (
      <View
        style={{
          backgroundColor: colors.background,
          flex: 1,
          paddingTop: ['pdf', 'txt', 'zip', 'apk'].includes(fileType) ? top : 0,
        }}
      >
        {['pdf', 'txt', 'zip', 'apk'].includes(fileType) && (
          <Header
            colors={colors}
            handleChooseOption={handleChooseOption}
            headerTitle={fileType}
            onBackPress={onBackPress}
            handleSearch={handleSearch}
          />
        )}
        <MultiSelect
          multiSelect={multiSelect}
          displaySelectedSize={`${selectedSize} / ${files?.length}`}
          colors={colors}
          selectAll={selectAll}
          cancelMultiSelect={cancelMultiSelect}
          handleCopyFile={handleCopyFile}
          handleDeleteFile={handleDeleteFile}
          handleMoveFile={handleMoveFile}
          toggleSelectAll={toggleSelectAll}
        />
        <FlatList
          data={files}
          keyExtractor={(item) => `${item?.path}`}
          renderItem={renderFileItemDoc}
          getItemLayout={getItemLayout}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          ListEmptyComponent={renderEmptyComponent}
        />

        <FsFileTransferDialog
          fileType={fileType}
          isVisible={destinationDialogVisible}
          setIsVisible={setDestinationDialogVisible}
          moveDir={moveDir}
          setMoveDir={setMoveDir}
          moveSelectedFiles={moveSelectedFiles}
          moveOrCopy={moveOrCopy}
          setMoveOrCopy={setMoveOrCopy}
        />
        <Dialog.Container visible={renameDialogVisible}>
          <Dialog.Title style={{ color: 'black' }}>Rename file</Dialog.Title>
          <Dialog.Input
            textInputRef={renameInputRef}
            value={decodeURI(newFileName)}
            onChangeText={(text) => {
              setNewFileName(text);
            }}
            onKeyPress={() => {
              setInitialSelectionDone(true);
            }}
            selection={
              !initialSelectionDone
                ? { start: 0, end: decodeURI(newFileName).split('.')[0].length }
                : undefined
            }
            style={{ color: 'black' }}
          ></Dialog.Input>
          <Dialog.Button
            label="Cancel"
            onPress={() => {
              setRenameDialogVisible(false);
            }}
          />
          <Dialog.Button label="Rename" onPress={() => onRename()} />
        </Dialog.Container>

        <DisplayOptionModal
          openOption={openOption}
          setOpenOption={setOpenOption}
          handleSort={handleSort}
        />
      </View>
    );
  }
);
