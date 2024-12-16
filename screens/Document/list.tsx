import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
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
import {
  setSnack,
  snackActionPayload,
} from '../../features/files/snackbarSlice';
import useNewSelectionChange from '../../hooks/newUseSelectedChange';
import Dialog from 'react-native-dialog';
import { styles } from './style';
import { ExtendedAsset, fileItem } from '../../types';
import MediaItem from '../../components/Browser/Files/MediaItem';


type TabDocFilesProps = {
    fileType: string
    selectAll: boolean;
  };
  
  export const TabDocFiles: React.FC<TabDocFilesProps> = React.memo(({ fileType, selectAll }) => {
    const { docFiles, txtFiles, csvExcelFiles, pdfFiles, zipFiles ,apkFile, imageFiles, loading, error } = useAppSelector(
      (state) => state.documentFile
    );
    const fileMap = {
        'doc': docFiles,
        'text': txtFiles,
        'pdf': pdfFiles,
        'zip': zipFiles,
        'app': apkFile,
        'image': imageFiles,
        'default': csvExcelFiles, // Giá trị mặc định
      };
    const data = (fileMap[fileType] || fileMap['default']);
    const dispatch = useAppDispatch();
    const [selectedFiles, setSelectedFiles] = useState<ReadDirItem[]>([]);
    const [selectedMediaFiles, setSelectedMediaFiles] = useState<fileItem[]>([]);
    const [renameDialogVisible, setRenameDialogVisible] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [renamingFile, setRenamingFile] = useState<ReadDirItem>();
    const [renamingMediaFile, setRenamingMediaFile] = useState<fileItem>();
    const [destinationDialogVisible, setDestinationDialogVisible] =
      useState(false);
    const [moveOrCopy, setMoveOrCopy] = useState('');
    const { multiSelect, allSelected } = useNewSelectionChange(
      data,
      selectedFiles
    );
    const [moveDir, setMoveDir] = useState('');
    const [initialSelectionDone, setInitialSelectionDone] = useState(false);
    const renameInputRef = useRef<TextInput>(null);
  
    const handleSetSnack = (data: snackActionPayload) => {
      dispatch(setSnack(data));
    };
  
    const deleteSelectedFiles = async (file?: ReadDirItem) => {
      const filestoBeDeleted = file ? [file] : selectedFiles;
  
      if (!filestoBeDeleted.length) {
        console.warn('Không có file nào được chọn để xóa');
        return false;
      }
  
      dispatch(removeFileToTrash({filestoBeDeleted, fileType: 'docx'}))
      setSelectedFiles([]);
      try {
        handleSetSnack({
          message: 'Files deleted!',
        });
  
        
        return true;
      } catch (error) {
        console.error('Lỗi khi di chuyển file:', error);
        handleSetSnack({
          message: 'Failed to delete files!',
          label: 'error',
        });
        return false;
      }
    };
    
    const deleteSelectedMediaFiles = async (file?: fileItem) => {
      const filestoBeDeleted = (file ? [file] : selectedMediaFiles).map((item) => {
        return {
          name: item.name,
          path: item.uri.slice(7),
          size: item.size
        } as ReadDirItem
      });

  
      if (!filestoBeDeleted.length) {
        console.warn('Không có file nào được chọn để xóa');
        return false;
      }
  
      dispatch(removeFileToTrash({filestoBeDeleted, fileType: 'docx'}))
      setSelectedFiles([]);
      try {
        handleSetSnack({
          message: 'Files deleted!',
        });
  
        
        return true;
      } catch (error) {
        console.error('Lỗi khi di chuyển file:', error);
        handleSetSnack({
          message: 'Failed to delete files!',
          label: 'error',
        });
        return false;
      }
    };
  
    const toggleSelect = (item: ReadDirItem) => {
      const isSelected =
        selectedFiles.findIndex((file) => file.path === item.path) !== -1;
      if (!isSelected) {
        setSelectedFiles((prev) => [...prev, item]);
      } else {
        setSelectedFiles((prev) =>
          prev.filter((file) => file.path !== item.path)
        );
      }
    };

    const toggleMediaSelect = (item: fileItem) => {
      const isSelected =
        selectedMediaFiles.findIndex((file) => file.uri === item.uri) !== -1;
      if (!isSelected) {
        setSelectedMediaFiles((prev) => [...prev, item]);
      } else {
        setSelectedMediaFiles((prev) =>
          prev.filter((file) => file.uri !== item.uri)
        );
      }
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
  
    useEffect(() => {
      if (error) {
        handleSetSnack({
          message: `Error ${error}`,
          label: 'error'
        });
      }
    }, [error]);
  
    const onRename = async () => {
      const selectedFile = renamingFile.path ?? renamingMediaFile.uri.slice(7)
      const directoryPath = selectedFile.substring(
        0,
        selectedFile.lastIndexOf('/')
      );
      const newPath = `${directoryPath}/${newFileName}`;
      dispatch(renameFiles({ oldPath: renamingFile.path, newPath }));
      setRenamingFile(undefined)
      setRenamingMediaFile(undefined)
    };
  
    const renderFileItemDoc = ({ item }) => (
      <FileItemCommon
        item={item}
        toggleSelect={toggleSelect}
        multiSelect={multiSelect}
        setTransferDialog={setDestinationDialogVisible}
        setMoveOrCopy={setMoveOrCopy}
        deleteSelectedFiles={deleteSelectedFiles}
        setRenamingFile={setRenamingFile}
        setRenameDialogVisible={setRenameDialogVisible}
        setNewFileName={setNewFileName}
      ></FileItemCommon>
    );

    const renderMediaItem = ( {item }) => (
      <MediaItem 
        item={item}
        toggleSelect={toggleMediaSelect}
        multiSelect={multiSelect}
        setMoveOrCopy={setMoveOrCopy}
        deleteSelectedFiles={deleteSelectedMediaFiles}
        setRenamingFile={setRenamingMediaFile}
        setRenameDialogVisible={setRenameDialogVisible}
        setNewFileName={setNewFileName}>
      </MediaItem>
    );
  
    const renderEmptyComponent = useCallback(
      () => (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="folder-open" size={64} color="gray" />
          <Text style={styles.emptyText}>Document file do not exist</Text>
        </View>
      ), []
    );
  
    return (
      <View style={{ backgroundColor: 'white' }}>
        <FlatList
          data={data}
          keyExtractor={(item) => `${item?.path}`}
          renderItem={renderFileItemDoc}
          initialNumToRender={10} // Render một số lượng item ban đầu
          windowSize={5}
          ListEmptyComponent={renderEmptyComponent}
        />
        {/* <FileTransferDialog
          isVisible={destinationDialogVisible}
          setIsVisible={setDestinationDialogVisible}
          moveDir={moveDir}
          setMoveDir={setMoveDir}
          moveSelectedFiles={moveSelectedFiles}
          moveOrCopy={moveOrCopy}
          setMoveOrCopy={setMoveOrCopy}
        /> */}
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
  });