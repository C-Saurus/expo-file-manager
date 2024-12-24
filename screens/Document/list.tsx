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
import FileItemCommon from '../../components/Browser/Files/FileItemCommon';
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
} from '../../utils/Constants';
import { DisplayOptionModal } from '../../components/Modals/DisplayOptionModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabDocFilesProps = {
  data: ReadDirItem[];
  fileType?: string;
};

export const TabDocFiles: React.FC<TabDocFilesProps> = React.memo(
  ({ data, fileType }) => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { top } = useSafeAreaInsets();
    const { colors } = useAppSelector((state) => state.theme.theme);
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
    const [files, setFiles] = useState<
      (ReadDirItem & { selected?: boolean })[]
    >(
      data.map((file) => {
        return {
          ...file,
          selected: false,
        };
      })
    );

    useEffect(() => {
      console.log('TabDocFiles');
    }, [data]);

    const selectedFiles = () => {
      return files.filter((file) => file.selected);
    };

    const deleteSelectedFiles = async (item?: ReadDirItem) => {
      try {
        setLoading(true);
        const deleteFile = multiSelect
          ? files.filter((file) => file.selected === true)
          : [item];
        console.log('deleteFile', deleteFile);
        const res = await removeFileToTrash(deleteFile);
        console.log('res', res);
        const filesAfterDelete = files
          .filter((file) => !res.includes(file.path))
          .map((file) => {
            return {
              ...file,
              selected: false,
            };
          });
        setFiles(filesAfterDelete);
        cancelMultiSelect();
      } catch (error) {
        console.error('Lỗi khi di chuyển file:', error);
      }
      setLoading(false);
    };

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
    };

    const cancelMultiSelect = () => {
      setMultiSelect(false);
      setSelectAll(false);
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
        setFiles(
          files.map((item) => {
            item.selected = true;
            return item;
          })
        );
      } else {
        setFiles(
          files.map((item) => {
            item.selected = false;
            return item;
          })
        );
      }
      setSelectAll((prev) => !prev);
    };

    const executeTransfer = async (
      selectedFiles: ReadDirItem[],
      destination: string
    ) => {
      const transferPromises = selectedFiles.map((file) => {
        if (moveOrCopy === 'Copy')
          return moveFileToCustomeFolder(file.path, destination);
        else return copyFileToCustomeFolder(file.path, destination);
      });
      const res = await Promise.all(transferPromises);
      const filesAfterDelete =
        moveOrCopy === 'Copy'
          ? files
          : files.filter((file) => !res.includes(file.path));

      setFiles(
        filesAfterDelete.map((file) => {
          return {
            ...file,
            selected: false,
          };
        })
      );
      cancelMultiSelect();
      setDestinationDialogVisible(false);
      setMoveDir('');
      setMoveOrCopy('');
    };

    const moveSelectedFiles = async (destination: string) => {
      const selectedFiles = files.filter((file) => file.selected);
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
      (item: ReadDirItem & { selected?: boolean }, multiSelect?: boolean) => {
        console.log('==toggleSelect==1');
        if (multiSelect) {
          setMultiSelect(true);
          console.log('==toggleSelect==2');
        }
        setFiles(
          files.map((i) => {
            if (item === i) {
              i.selected = !i.selected;
            }
            return i;
          })
        );
      },
      []
    );

    const handleSearch = () => {

    }

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
      dispatch(renameFiles({ oldPath: renamingFile.path, newPath }));
      setRenamingFile(undefined);
    };

    const renderFileItemDoc = ({ item }) => {
      return (
        <FileItemCommon
          key={`${item.path}`}
          item={item}
          multiSelect={multiSelect}
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
      <View
        style={{
          backgroundColor: 'white',
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
          displaySelectedSize={`${selectedFiles().length} / ${files?.length}`}
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
