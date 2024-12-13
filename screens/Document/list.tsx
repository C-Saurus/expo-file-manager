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


type TabDocFilesProps = {
    fileType: string
    selectAll: boolean;
  };
  
  export const TabDocFiles: React.FC<TabDocFilesProps> = React.memo(({ fileType, selectAll }) => {
    const { docFiles, txtFiles, csvExcelFiles, pdfFiles, zipFiles ,apkFile, loading, error } = useAppSelector(
      (state) => state.documentFile
    );
    const fileMap = {
        'doc': docFiles,
        'text': txtFiles,
        'pdf': pdfFiles,
        'zip': zipFiles,
        'app': apkFile,
        'default': csvExcelFiles, // Giá trị mặc định
      };
    const data = fileMap[fileType] || fileMap['default'];
    const dispatch = useAppDispatch();
    const [selectedFiles, setSelectedFiles] = useState<ReadDirItem[]>([]);
    const [renameDialogVisible, setRenameDialogVisible] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [renamingFile, setRenamingFile] = useState<ReadDirItem>();
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
      const directoryPath = renamingFile.path.substring(
        0,
        renamingFile.path.lastIndexOf('/')
      );
      const newPath = `${directoryPath}/${newFileName}`;
      dispatch(renameFiles({ oldPath: renamingFile.path, newPath }));
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
          keyExtractor={(item) => item.path}
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