import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, View, FlatList, Alert, Platform, TextInput } from 'react-native';
import { styles } from './style';
import { useAppSelector } from '../../hooks/reduxHooks';
import { ExtendedAsset } from '../../types';
import moment from 'moment';
import { AssetItem } from '../../components/Browser/PickImages/AssetItem';
import {
  copyFileToCustomeFolder,
  getCustomeFileByFolder,
  moveFileToCustomeFolder,
  SIZE,
} from '../../utils/Constants';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MultiSelect } from '../../components/Modals/MultiSelectModal';
import { removeFileToTrash } from '../../stores/document/action';
import { FsFileTransferDialog } from '../../components/Browser/FsFileTransferDialog';
import Dialog from 'react-native-dialog';
import { MaterialIcons } from '@expo/vector-icons';
import { FileItemMedia } from '../../components/Browser/Files/FileItemMedia';

export const PhotosByDate: React.FC<{
  fileType: string;
  viewMode: number;
  assets: ExtendedAsset[];
  setAssets: (asset: ExtendedAsset[]) => void;
  setLoading: (loading: boolean) => void;
  getAlbumAssets: () => void;
}> = React.memo(
  ({ fileType, viewMode, assets, setAssets, setLoading, getAlbumAssets }) => {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const { colors } = useAppSelector((state) => state.theme.theme);
    const [multiSelect, setMultiSelect] = useState<boolean>(false);
    const [groupedPhotos, setGroupedPhotos] = useState<{
      [key: string]: ExtendedAsset[];
    }>({});
    const [destinationDialogVisible, setDestinationDialogVisible] =
      useState(false);
    const [moveOrCopy, setMoveOrCopy] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [moveDir, setMoveDir] = useState('');
    const [renameDialogVisible, setRenameDialogVisible] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [renamingFile, setRenamingFile] = useState<ExtendedAsset>();
    const [initialSelectionDone, setInitialSelectionDone] = useState(false);
    const listSelected = useRef([]);
    const [selectedSize, setSelectedSize] = useState(0);
    const renameInputRef = useRef<TextInput>(null);

    useEffect(() => {
      groupPhotosByDate();
    }, [assets]);

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
      console.log('filePath', fileFolderPath + '/' + newFileName);
      const filesAfterDelete = assets
        .filter((file) => file.uri === renamingFile.uri)
        .map((file) => {
          return {
            ...file,
            name: fileFolderPath + '/' + newFileName,
          };
        });
      setAssets(filesAfterDelete);
      setRenamingFile(undefined);
    };

    const deleteSelectedFiles = useCallback(
      async (item?: ExtendedAsset) => {
        try {
          setLoading(true);
          const deleteFile = listSelected.current.length
            ? listSelected.current
            : [item.uri];
          console.log('deleteFile', deleteFile);
          const res = await removeFileToTrash(
            deleteFile.map((item) => {
              return {
                ...item,
                path: item.uri.slice(7),
              };
            })
          );
          console.log('res', res);
          const filesAfterDelete = assets
            .filter((file) => !res.includes(file.uri))
            .map((file) => {
              return {
                ...file,
                selected: false,
              };
            });
          setAssets(filesAfterDelete);
          cancelMultiSelect();
        } catch (error) {
          console.error('Lỗi khi di chuyển file:', error);
        }
        setLoading(false);
      },
      [assets]
    );

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
        listSelected.current = assets.map((file) => {
          return file.uri;
        });
      } else {
        listSelected.current = [];
      }
      setSelectAll((prev) => !prev);
      setSelectedSize(listSelected.current.length);
    };

    const executeTransfer = async (
      selectedFiles: ExtendedAsset[],
      destination: string
    ) => {
      const transferPromises = selectedFiles.map((file) => {
        if (moveOrCopy === 'Copy')
          return moveFileToCustomeFolder(file.uri, destination);
        else return copyFileToCustomeFolder(file.uri, destination);
      });
      const res = await Promise.all(transferPromises);
      const filesAfterDelete =
        moveOrCopy === 'Copy'
          ? assets
          : assets.filter((file) => !res.includes(file.uri));

      setAssets(
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
      const selectedFiles = listSelected.current;
      console.log('destination', destination.slice(7));
      const destinationFolderFiles = await getCustomeFileByFolder(
        destination.slice(7)
      );
      const conflictingFiles = selectedFiles.filter(
        (file) =>
          destinationFolderFiles.findIndex(
            (destinationFile) => `file://${destinationFile.path}` === file.uri
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

    const groupPhotosByDate = () => {
      const newGroupedPhotos = {}; // Tạo bản sao của groupedPhotos

      assets.forEach((photo) => {
        const date = moment(photo.creationTime).format('DD/MM/YYYY');
        if (!newGroupedPhotos[date]) {
          newGroupedPhotos[date] = [];
        }
        newGroupedPhotos[date].push(photo);
      });
      setGroupedPhotos(newGroupedPhotos);
      setLoading(false);
    };

    const toggleSelect = useCallback(
      (item: ExtendedAsset, multiSelectEmit?: boolean) => {
        console.log('==toggleSelect==1');
        if (multiSelect) {
          setMultiSelect(true);
          console.log('==toggleSelect==2');
        }
        if (listSelected.current.includes(item.uri)) {
          listSelected.current = listSelected.current.filter(
            (f) => f !== item.uri
          );
        } else {
          listSelected.current.push(item.uri);
        }
        setSelectedSize(listSelected.current.length);
      },
      []
    );

    const renderPhotoItem = useCallback(
      ({ item }) =>
        item?.id ? (
          <AssetItem
            item={item}
            toggleSelect={toggleSelect}
            itemType={fileType}
          />
        ) : (
          <View style={styles.emptyItem}></View>
        ),
      [assets, fileType]
    );

    const renderGroup = ({ item: { date, photos } }) => (
      <View style={styles.dateGroup}>
        <Text style={styles.dateTitle}>{date}</Text>
        <FlatList
          data={photos.length >= 3 ? photos : [...photos, {}, {}].slice(0, 3)}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => `${item.id}-${item.creationTime}`}
          numColumns={3}
        />
      </View>
    );

    const renderFileItemMedia = ({ item }: { item: ExtendedAsset }) => (
      <FileItemMedia
        item={item}
        selectAll={selectAll}
        toggleSelect={toggleSelect}
        multiSelect={multiSelect}
        setTransferDialog={setDestinationDialogVisible}
        setMoveOrCopy={setMoveOrCopy}
        deleteSelectedFiles={deleteSelectedFiles}
        setRenamingFile={setRenamingFile}
        setRenameDialogVisible={setRenameDialogVisible}
        setNewFileName={setNewFileName}
      ></FileItemMedia>
    );

    const renderEmptyComponent = useCallback(
      () => (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="folder-open" size={64} color="gray" />
          <Text style={styles.emptyText}>Media file do not exist</Text>
        </View>
      ),
      []
    );

    const groupedData = Object.entries(groupedPhotos).map(([date, photos]) => ({
      date,
      photos,
    }));

    return (
      <View style={{ ...styles.container, backgroundColor: colors.background }}>
        {!viewMode ? (
          <FlatList
            data={groupedData}
            renderItem={renderGroup}
            keyExtractor={(item) => `${item.date}`}
            onEndReached={() => {
              getAlbumAssets(); // Tải thêm ảnh nếu có
            }}
            getItemLayout={(data, index) => ({
              length: SIZE / 3,
              offset: (SIZE / 3) * index,
              index,
            })}
            onEndReachedThreshold={0.6}
            ListEmptyComponent={renderEmptyComponent}
          />
        ) : (
          <FlatList
            data={assets}
            keyExtractor={(item) => `${item?.uri}-${item.name}`}
            renderItem={renderFileItemMedia}
            getItemLayout={(data, index) => ({
              length: 75, // item height
              offset: 75 * index,
              index,
            })}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            onEndReachedThreshold={0.6}
            onEndReached={() => {
              getAlbumAssets();
            }}
            ListEmptyComponent={renderEmptyComponent}
          />
        )}
        <MultiSelect
          multiSelect={multiSelect}
          displaySelectedSize={`${selectedSize} / ${assets?.length}`}
          colors={colors}
          selectAll={selectAll}
          cancelMultiSelect={cancelMultiSelect}
          handleCopyFile={handleCopyFile}
          handleDeleteFile={handleDeleteFile}
          handleMoveFile={handleMoveFile}
          toggleSelectAll={toggleSelectAll}
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
      </View>
    );
  }
);
