import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
  BackHandler,
  TextInput,
  PermissionsAndroid,
  Text,
} from 'react-native';

import Dialog from 'react-native-dialog';

import {
  Dialog as GalleryDialog,
  ProgressDialog,
} from 'react-native-simple-dialogs';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Pickimages from '../components/Browser/PickImages';
import ActionSheet from '../components/ActionSheet';

import allProgress from '../utils/promiseProgress';

import { NewFolderDialog } from '../components/Browser/NewFolderDialog';
import { DownloadDialog } from '../components/Browser/DownloadDialog';
import { FileTransferDialog } from '../components/Browser/FileTransferDialog';

import axios, { AxiosError } from 'axios';
import moment from 'moment';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import * as mime from 'react-native-mime-types';

import { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { ExtendedAsset, fileItem } from '../types';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { setImages } from '../features/files/imagesSlice';
import { setSnack, snackActionPayload } from '../features/files/snackbarSlice';
import { HEIGHT, imageFormats, reExt, SIZE } from '../utils/Constants';
import CustomHeader from '../components/Header/CommondHeader';
import { getCategoryByExtension } from '../utils/getFileByCategory';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DisplayOptionModal } from '../components/Modals/DisplayOptionModal';
import { FileItem } from '../components/Browser/Files/FileItem';

type BrowserParamList = {
  Browser: { prevDir: string; folderName: string };
};

type IBrowserProps = StackScreenProps<BrowserParamList, 'Browser'>;

const Browser = ({ route }: IBrowserProps) => {
  const dispatch = useAppDispatch();
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useAppSelector((state) => state.theme.theme);
  const currentDir = route?.params?.prevDir;
  const [moveDir, setMoveDir] = useState('');
  const [files, setFiles] = useState<fileItem[]>([]);
  const [folderDialogVisible, setFolderDialogVisible] = useState(false);
  const [downloadDialogVisible, setDownloadDialogVisible] = useState(false);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [renamingFile, setRenamingFile] = useState<fileItem>();
  const renameInputRef = useRef<TextInput>(null);
  const [multiImageVisible, setMultiImageVisible] = useState(false);
  const [importProgressVisible, setImportProgressVisible] = useState(false);
  const [destinationDialogVisible, setDestinationDialogVisible] =
    useState(false);
  const [newFileActionSheet, setNewFileActionSheet] = useState(false);
  const [moveOrCopy, setMoveOrCopy] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [openOption, setOpenOption] = useState(false);
  const [selectedSize, setSelectedSize] = useState(0);
  const listSelected = useRef([]);

  useEffect(() => {
    getFiles();
  }, [currentDir]);

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const renderItem = ({ item }: { item: fileItem }) => (
    <FileItem
      item={item}
      currentDir={currentDir}
      toggleSelect={toggleSelect}
      multiSelect={multiSelect}
      selectAll={selectAll}
      setTransferDialog={setDestinationDialogVisible}
      setMoveOrCopy={setMoveOrCopy}
      deleteSelectedFiles={deleteSelectedFiles}
      setRenamingFile={setRenamingFile}
      setRenameDialogVisible={setRenameDialogVisible}
      setNewFileName={setNewFileName}
    ></FileItem>
  );

  const handleDownload = (downloadUrl: string) => {
    axios
      .get(downloadUrl)
      .then((res) => {
        const fileExt = mime.extension(res.headers['content-type']);
        FileSystem.downloadAsync(
          downloadUrl,
          currentDir + '/DL_' + moment().format('DDMMYHmmss') + '.' + fileExt
        )
          .then(() => {
            getFiles();
            setDownloadDialogVisible(false);
            handleSetSnack({
              message: 'Download complete',
            });
          })
          .catch((_) => {
            handleSetSnack({
              message: 'Please provide a correct url',
            });
          });
      })
      .catch((error: AxiosError) =>
        handleSetSnack({
          message: error.message,
        })
      );
  };

  const toggleSelect = useCallback((item: fileItem, multiSelect?: boolean) => {
    console.log('==toggleSelect==1');
    if (multiSelect) {
      setMultiSelect(true);
      console.log('==toggleSelect==2');
    }
    if (listSelected.current.includes(item.uri)) {
      listSelected.current = listSelected.current.filter((f) => f !== item.uri);
    } else {
      listSelected.current.push(item.uri);
    }
    setSelectedSize(listSelected.current.length);
  }, []);

  const toggleSelectAll = () => {
    if (!selectAll) {
      listSelected.current = files.map((file) => {
        return file.uri;
      });
    } else {
      listSelected.current = [];
    }
    setSelectAll((prev) => !prev);
    setSelectedSize(listSelected.current.length);
  };

  const getFiles = async () => {
    FileSystem.readDirectoryAsync(currentDir)
      .then((dirFiles) => {
        const filteredFiles = dirFiles.filter(
          (file) => file !== 'RCTAsyncLocalStorage'
        );
        const filesProms = filteredFiles.map((fileName) =>
          FileSystem.getInfoAsync(currentDir + '/' + fileName)
        );
        Promise.all(filesProms).then((results) => {
          let tempfiles: fileItem[] = results.map((file) => {
            const name = file.uri.endsWith('/')
              ? file.uri
                  .slice(0, file.uri.length - 1)
                  .split('/')
                  .pop()
              : file.uri.split('/').pop();
            return Object({
              ...file,
              name,
            });
          });
          setFiles(tempfiles);
          if (currentDir.includes('Image')) {
            const tempImageFiles = results.filter((file) => {
              let fileExtension = file.uri
                .split('/')
                .pop()
                .split('.')
                .pop()
                .toLowerCase();
              if (imageFormats.includes(fileExtension)) {
                return {
                  uri: file.uri,
                };
              }
            });
            dispatch(setImages(tempImageFiles));
          }
        });
      })
      .catch((_) => {});
  };

  async function createDirectory(name: string) {
    FileSystem.makeDirectoryAsync(currentDir + '/' + name)
      .then(() => {
        getFiles();
        setFolderDialogVisible(false);
      })
      .catch(() => {
        handleSetSnack({
          message: 'Folder could not be created or already exists.',
        });
      });
  }

  const pickImage = async () => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          handleSetSnack({
            message:
              'Sorry, we need camera roll permissions to make this work!',
          });
        }
        MediaLibrary.requestPermissionsAsync();
      }
    })();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const { uri, type } = result;
      const filename: string = uri.replace(/^.*[\\\/]/, '');
      const ext: string | null = reExt.exec(filename)![1];
      const fileNamePrefix = type === 'image' ? 'IMG_' : 'VID_';
      FileSystem.moveAsync({
        from: uri,
        to:
          currentDir +
          '/' +
          fileNamePrefix +
          moment().format('DDMMYHmmss') +
          '.' +
          ext,
      })
        .then((_) => getFiles())
        .catch((err) => console.log(err));
    }
  };

  async function handleCopy(
    from: string,
    to: string,
    successMessage: string,
    errorMessage: string
  ): Promise<void> {
    FileSystem.copyAsync({ from, to })
      .then(() => {
        getFiles();
        handleSetSnack({
          message: successMessage,
        });
      })
      .catch(() =>
        handleSetSnack({
          message: errorMessage,
        })
      );
  }

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: false,
    });
    console.log('result');
    if (result.type === 'success') {
      const ext = result.mimeType.split('/')[1];
      const category = getCategoryByExtension(ext);
      if (category !== route.params.folderName.toLowerCase()) {
        Toast.show({
          type: 'error',
          text1: `Please choose ${route.params.folderName.toLowerCase()} file`,
        });
        return;
      }
      const { exists: fileExists } = await FileSystem.getInfoAsync(
        currentDir + '/' + result.name
      );
      if (fileExists) {
        Alert.alert(
          'Conflicting File',
          `The destination folder has a file with the same name ${result.name}`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Replace the file',
              onPress: () => {
                handleCopy(
                  result.uri,
                  currentDir + '/' + result.name,
                  `${result.name} successfully copied.`,
                  'An unexpected error importing the file.'
                );
              },
              style: 'default',
            },
          ]
        );
      } else {
        handleCopy(
          result.uri,
          currentDir + '/' + result.name,
          `${result.name} successfully copied.`,
          'An unexpected error importing the file.'
        );
      }
    }
  };

  const onMultiSelectSubmit = async (data: ExtendedAsset[]) => {
    const transferPromises = data.map((file) =>
      FileSystem.copyAsync({
        from: file.uri,
        to: currentDir + '/' + file.filename,
      })
    );
    Promise.all(transferPromises).then(() => {
      setMultiImageVisible(false);
      getFiles();
    });
  };

  const moveSelectedFiles = async (destination: string) => {
    const selectedFiles = listSelected.current;
    const destinationFolderFiles = await FileSystem.readDirectoryAsync(
      destination
    );
    function executeTransfer() {
      const transferPromises = selectedFiles.map((file) => {
        if (moveOrCopy === 'Copy')
          return FileSystem.copyAsync({
            from: currentDir + '/' + file.name,
            to: destination + '/' + file.name,
          });
        else
          return FileSystem.moveAsync({
            from: currentDir + '/' + file.name,
            to: destination + '/' + file.name,
          });
      });
      allProgress(transferPromises, (p) => {}).then((_) => {
        setDestinationDialogVisible(false);
        setMoveDir('');
        setMoveOrCopy('');
        getFiles();
        cancelMultiSelect();
      });
    }
    const conflictingFiles = selectedFiles.filter((file) =>
      destinationFolderFiles.includes(file.name)
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
              executeTransfer();
            },
            style: 'default',
          },
        ]
      );
    } else {
      executeTransfer();
    }
  };

  const deleteSelectedFiles = useCallback(async (item?: fileItem) => {
    const deleteFile = multiSelect ? listSelected.current : [item.uri];
    const deleteProms = deleteFile.map((file) =>
      FileSystem.deleteAsync(file.uri)
    );
    Promise.all(deleteProms)
      .then((_) => {
        console.log('deleteProms');
      })
      .catch((err) => {
        console.log('ERRR');
        console.log(err);
      })
      .finally(() => {
        getFiles();
        cancelMultiSelect();
      });
  }, []);

  const [initialSelectionDone, setInitialSelectionDone] = useState(false);

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
    const filePathSplit = renamingFile.uri.split('/');
    const fileFolderPath = filePathSplit
      .slice(0, filePathSplit.length - 1)
      .join('/');
    FileSystem.getInfoAsync(fileFolderPath + '/' + newFileName).then((res) => {
      if (res.exists)
        handleSetSnack({
          message: 'A folder or file with the same name already exists.',
        });
      else
        FileSystem.moveAsync({
          from: renamingFile.uri,
          to: fileFolderPath + '/' + newFileName,
        })
          .then(() => {
            setRenameDialogVisible(false);
            getFiles();
          })
          .catch((_) =>
            handleSetSnack({
              message: 'Error renaming the file/folder',
            })
          );
    });
  };

  const handleSetSnack = (data: snackActionPayload) => {
    dispatch(setSnack(data));
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

  const handleSearch = () => {};

  const onAddFilePress = () => {
    setNewFileActionSheet(true);
  };

  const onAddFolderPress = () => {
    setFolderDialogVisible(true);
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
  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="folder-open" size={64} color="gray" />
        <Text style={styles.emptyText}>
          {route.params.folderName} file is empty
        </Text>
      </View>
    ),
    []
  );

  return (
    <View style={{ ...styles.container, backgroundColor: colors.background }}>
      <ActionSheet
        title={'Add a new file'}
        numberOfLinesTitle={undefined}
        visible={newFileActionSheet}
        actionItems={[
          'Camera Roll',
          'Multi Image Picker',
          'Import File from Storage',
          'Download',
          'Cancel',
        ]}
        itemIcons={[
          'camera',
          'image',
          'drive-file-move-outline',
          'file-download',
          'close',
        ]}
        onClose={setNewFileActionSheet}
        onItemPressed={(buttonIndex) => {
          if (buttonIndex === 0) {
            pickImage();
          } else if (buttonIndex === 1) {
            setMultiImageVisible(true);
          } else if (buttonIndex === 2) {
            pickDocument();
          } else if (buttonIndex === 3) {
            setDownloadDialogVisible(true);
          }
        }}
        cancelButtonIndex={4}
        modalStyle={{ backgroundColor: colors.background2 }}
        itemTextStyle={{ color: colors.text }}
        titleStyle={{ color: colors.secondary }}
      />
      <FileTransferDialog
        isVisible={destinationDialogVisible}
        setIsVisible={setDestinationDialogVisible}
        currentDir={currentDir}
        moveDir={moveDir}
        setMoveDir={setMoveDir}
        moveSelectedFiles={moveSelectedFiles}
        moveOrCopy={moveOrCopy}
        setMoveOrCopy={setMoveOrCopy}
      />
      <NewFolderDialog
        visible={folderDialogVisible}
        createDirectory={createDirectory}
        setFolderDialogVisible={setFolderDialogVisible}
      />
      <DownloadDialog
        visible={downloadDialogVisible}
        handleDownload={handleDownload}
        setDownloadDialog={setDownloadDialogVisible}
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
      <GalleryDialog
        dialogStyle={{
          backgroundColor: colors.background2,
        }}
        animationType="slide"
        contentStyle={styles.contentStyle}
        overlayStyle={styles.overlayStyle}
        visible={multiImageVisible}
        onTouchOutside={() => setMultiImageVisible(false)}
      >
        <Pickimages
          onMultiSelectSubmit={onMultiSelectSubmit}
          onClose={() => setMultiImageVisible(false)}
        />
      </GalleryDialog>

      <ProgressDialog
        visible={importProgressVisible}
        title="Importing Assets"
        message="Please, wait..."
      />
      <CustomHeader
        onBackPress={onBackPress}
        onAddFolderPress={onAddFolderPress}
        handleChooseOption={handleChooseOption}
        handleSearch={handleSearch}
        colors={colors}
        headerTitle={route.params.folderName}
      />
      {multiSelect && (
        <View style={[styles.nav]}>
          <View style={styles.navFirst}>
            <Text style={styles.count}>
              {selectedSize} / {files?.length}
            </Text>
            <Text style={styles.count}>Multiple Select</Text>
            <TouchableOpacity onPress={() => cancelMultiSelect()}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.line}></View>
          <View style={styles.navFirst}>
            <TouchableOpacity onPress={handleMoveFile}>
              <MaterialCommunityIcons
                name="file-move-outline"
                size={24}
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCopyFile}>
              <Ionicons name="copy-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteFile}>
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color="black"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleSelectAll}>
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
      <View style={{ ...styles.fileList }}>
        <FlatList
          data={files}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={_keyExtractor}
          ListEmptyComponent={renderEmptyComponent}
        />
      </View>
      {multiSelect && (
        <View
          style={{ ...styles.bottomMenu, backgroundColor: colors.background }}
        >
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="export-variant"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      )}
      <DisplayOptionModal
        openOption={openOption}
        setOpenOption={setOpenOption}
        handleSort={handleSort}
      />
      <TouchableOpacity style={styles.fab} onPress={onAddFilePress}>
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const _keyExtractor = (item: fileItem) => item.name;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SIZE,
    paddingTop: Constants.statusBarHeight,
  },
  topButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginHorizontal: 10,
  },
  topLeft: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '25%',
  },
  topRight: {
    width: '75%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fileList: {
    flex: 1,
    marginHorizontal: 5,
  },
  bottomMenu: {
    height: 45,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  contentStyle: {
    width: SIZE,
    height: HEIGHT * 0.8,
    padding: 0,
    margin: 0,
  },
  overlayStyle: {
    width: SIZE,
    padding: 0,
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  nav: {
    flex: 1,
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'space-between',
    backgroundColor: '#4cabebfd',
  },
  navFirst: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  count: {
    fontSize: 16,
  },
  line: {
    height: 1,
    backgroundColor: '#1f3442fd',
  },
  fab: {
    position: 'absolute',
    bottom: 20, // Khoảng cách từ dưới màn hình
    right: 20, // Khoảng cách từ mép phải màn hình
    backgroundColor: '#007AFF', // Màu nền của FAB
    width: 60, // Kích thước FAB
    height: 60,
    borderRadius: 30, // Hình dạng tròn
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Tạo hiệu ứng nổi (trên Android)
    shadowColor: '#000', // Tạo hiệu ứng nổi (trên iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default Browser;
