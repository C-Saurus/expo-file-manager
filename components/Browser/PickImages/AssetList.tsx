import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  copyFileToCustomeFolder,
  getCustomeFileByFolder,
  moveFileToCustomeFolder,
  SIZE,
} from '../../../utils/Constants';
import { AssetItem } from './AssetItem';
import { ExtendedAsset } from '../../../types';
import * as MediaLibrary from 'expo-media-library';
import { useAppSelector } from '../../../hooks/reduxHooks';
import { MultiSelect } from '../../Modals/MultiSelectModal';
import { FsFileTransferDialog } from '../FsFileTransferDialog';
import { removeFileToTrash } from '../../../stores/document/action';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type AssetListProps = {
  fileType?: string;
  albumId?: string;
  handleImport?: (file: ExtendedAsset[]) => void;
};

export const AssetList = ({
  fileType,
  albumId,
  handleImport,
}: AssetListProps) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [loading, setLoading] = useState<boolean>(false);
  const [assets, setAssets] = useState<ExtendedAsset[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [multiSelect, setMultiSelect] = useState<boolean>(false);
  const [destinationDialogVisible, setDestinationDialogVisible] =
    useState(false);
  const [moveOrCopy, setMoveOrCopy] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [moveDir, setMoveDir] = useState('');
  const listSelected = useRef([]);
  const [selectedSize, setSelectedSize] = useState(0);

  useEffect(() => {
    return () => {
      setAssets([]);
      setHasNextPage(null);
      setEndCursor(null);
    };
  }, []);

  async function getAlbumAssets(albumId: string, after?: string | undefined) {
    setLoading(true);
    const options = {
      album: albumId,
      first: 20,
      sortBy: MediaLibrary.SortBy.creationTime,
      mediaType: MediaLibrary.MediaType[fileType],
    };
    if (after) options['after'] = after;
    const albumAssets = await MediaLibrary.getAssetsAsync(options);
    setAssets((prev) => [...prev, ...albumAssets.assets]);
    setHasNextPage(albumAssets.hasNextPage);
    setEndCursor(albumAssets.endCursor);
    setLoading(false);
  }

  useEffect(() => {
    if (albumId) getAlbumAssets(albumId);
  }, [albumId]);

  const deleteSelectedFiles = useCallback(
    async (item?: ExtendedAsset) => {
      try {
        setLoading(true);
        const deleteFile = listSelected.current.length
          ? listSelected.current.map((file) => {
              return file.uri;
            })
          : [item.uri];
        console.log('deleteFile', deleteFile);
        const res = await removeFileToTrash(
          deleteFile.map((item) => {
            return item.uri.slice(7);
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
      listSelected.current = assets;
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
        return moveFileToCustomeFolder(file.uri.slice(7), destination);
      else return copyFileToCustomeFolder(file.uri.slice(7), destination);
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

  const toggleSelect = useCallback(
    (item: ExtendedAsset, multiSelectEmit?: boolean) => {
      console.log('==toggleSelect==1');
      if (multiSelectEmit) {
        setMultiSelect(true);
        console.log('==toggleSelect==2');
      }
      if (listSelected.current.includes(item)) {
        listSelected.current = listSelected.current.filter(
          (f) => f.uri !== item.uri
        );
      } else {
        listSelected.current.push(item);
      }
      setSelectedSize(listSelected.current.length);
    },
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.confirmButton}>
        {multiSelect && !fileType && (
          <TouchableOpacity
            style={styles.handleImport}
            onPress={() => handleImport(listSelected.current)}
          >
            <MaterialCommunityIcons
              name="file-import-outline"
              size={30}
              color={colors.primary}
            />
            <Text
              style={{
                fontFamily: 'Poppins_500Medium',
                fontSize: 18,
                color: colors.primary,
              }}
            >
              {selectedSize}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        style={styles.albumList}
        contentContainerStyle={styles.contentContainer}
        numColumns={3}
        data={assets}
        renderItem={({ item }) => (
          <AssetItem
            item={item}
            toggleSelect={toggleSelect}
            selectAll={selectAll}
          />
        )}
        keyExtractor={(item) => `${albumId}-${item.id}`}
        onEndReached={() => {
          if (hasNextPage) getAlbumAssets(albumId, endCursor);
        }}
        onEndReachedThreshold={0.5}
      />
      <MultiSelect
        multiSelect={multiSelect && fileType}
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

const styles = StyleSheet.create({
  albumList: {
    width: SIZE,
  },
  contentContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleSheet.absoluteFillObject, // Phủ toàn bộ màn hình
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Màu nền mờ
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Đảm bảo overlay nằm trên cùng
  },
  confirmButton: {
    left: 10,
    padding: 10,
  },
  listContainer: {
    width: SIZE,
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAccessContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
  },
  noAccessText: {
    marginBottom: 20,
    fontFamily: 'Poppins_500Medium',
  },
  handleImport: {
    display: 'flex',
    flexDirection: 'row',
    width: 60,
    height: 30,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
});
