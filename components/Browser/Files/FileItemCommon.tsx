import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as mime from 'react-native-mime-types';
import humanFileSize from '../../../utils/Filesize';
import ActionSheet from '../../ActionSheet';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import { fileIcons } from '../../../utils/Constants';
import { ReadDirItem } from 'react-native-fs';
import { styles } from '.';
import { setMultiSelect } from '../../../stores/document/reducer';
import { removeFileToTrash } from '../../../stores/document/action';
import {
  setSnack,
  snackActionPayload,
} from '../../../features/files/snackbarSlice';

type Props = {
  item: ReadDirItem;
  setTransferDialog: (arg0: boolean) => void;
  setMoveOrCopy: (arg0: string) => void;
  setRenamingFile: (arg0: ReadDirItem & { selected?: boolean }) => void;
  setRenameDialogVisible: (arg0: boolean) => void;
  setNewFileName: (arg0: string) => void;
};

export default function FileItemCommon({
  item,
  setTransferDialog,
  setMoveOrCopy,
  setRenamingFile,
  setRenameDialogVisible,
  setNewFileName,
}: Props) {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { isMultiSelect, selectedFile } = useAppSelector(
    (state) => state.documentFile
  );

  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [itemActionsOpen, setItemActionsOpen] = useState(false);
  const itemMime = mime.lookup(item.path) || ' ';
  const itemType: string = item.isDirectory ? 'dir' : itemMime.split('/')[0];
  const itemFormat: string = item.isDirectory ? 'dir' : itemMime.split('/')[1];
  const handleSetSnack = (data: snackActionPayload) => {
    dispatch(setSnack(data));
  };

  const deleteSelectedFiles = async () => {
    try {
      dispatch(
        removeFileToTrash({ filestoBeDeleted: [item], fileType: 'docx' })
      );
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
  const ThumbnailImage = ({ uri }) => {
    return <Image style={styles.image} source={{ uri: `file://${uri}` }} />;
  };

  const ItemThumbnail = () => {
    switch (itemType) {
      case 'dir':
        return <Feather name="folder" size={35} color={colors.primary} />;
      case 'image':
      case 'video':
        return <ThumbnailImage uri={item.path} />;
      case 'audio':
        return (
          <FontAwesome5 name="file-audio" size={35} color={colors.primary} />
        );
      case 'font':
        return <FontAwesome5 name="font" size={35} color={colors.primary} />;
      case 'application':
        return (
          <MaterialCommunityIcons
            name={fileIcons[itemFormat] || 'file-outline'}
            size={35}
            color={colors.primary}
          />
        );
      case 'text':
        return (
          <MaterialCommunityIcons
            name={fileIcons[itemFormat] || 'file-outline'}
            size={35}
            color={colors.primary}
          />
        );
      default:
        return <Feather name="file" size={35} color={colors.primary} />;
    }
  };

  const toggleSelect = (item: ReadDirItem) => {
    console.log('toggleSelect', new Date());
    dispatch(setMultiSelect(item.path));
  };

  const onPressHandler = () => {
    console.log('isMultiSelect', isMultiSelect);
    if (!isMultiSelect) {
      if (itemType === 'image') {
      } else if (itemType === 'video') {
      } else if (itemType === 'audio') {
      } else {
        navigation.push('MiscFileView', {
          folderName: item.path,
        });
      }
    } else {
      toggleSelect(item);
    }
  };

  return (
    <View style={styles.container}>
      <ActionSheet
        title={
          isMultiSelect
            ? 'Choose an action for the selected items'
            : decodeURI(item.name)
        }
        numberOfLinesTitle={isMultiSelect ? undefined : 1}
        visible={itemActionsOpen}
        actionItems={['Rename', 'Copy', 'Move', 'Share', 'Delete', 'Cancel']}
        itemIcons={[
          'edit',
          'file-copy',
          'drive-file-move',
          'share',
          'delete',
          'close',
        ]}
        onClose={setItemActionsOpen}
        onItemPressed={(buttonIndex) => {
          if (buttonIndex === 4) {
            setTimeout(() => {
              Alert.alert(
                'Confirm Delete',
                `Are you sure you want to delete ${
                  isMultiSelect ? 'selected files' : 'this file'
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
          } else if (buttonIndex === 3) {
            Sharing.isAvailableAsync()
              .then((canShare) => {
                if (canShare) {
                  Sharing.shareAsync(`file://${item.path}`);
                }
              })
              .catch((error) =>
                console.log('[Error] share failed with err:', error)
              );
          } else if (buttonIndex === 2) {
            setMoveOrCopy('Move');
            //if (!multiSelect) toggleSelect(item);
            setTransferDialog(true);
          } else if (buttonIndex === 1) {
            setMoveOrCopy('Move');
          } else if (buttonIndex === 0) {
            setRenamingFile(item);
            setRenameDialogVisible(true);
            setNewFileName(item.name);
          }
        }}
        cancelButtonIndex={5}
        modalStyle={{ backgroundColor: colors.background2 }}
        itemTextStyle={{ color: colors.text }}
        titleStyle={{ color: colors.secondary }}
      />
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.itemLeft}
          activeOpacity={0.5}
          onPress={onPressHandler}
          onLongPress={() => {
            console.log('onLongPress', isMultiSelect);
            if (!isMultiSelect) {
              toggleSelect(item);
            }
          }}
        >
          <View style={styles.itemThumbnail}>
            {itemType && <ItemThumbnail />}
          </View>
          <View style={styles.itemDetails}>
            <Text
              numberOfLines={1}
              style={{ ...styles.fileName, color: colors.primary }}
            >
              {decodeURI(item.name)}
            </Text>
            <Text style={{ ...styles.fileDetailText, color: colors.secondary }}>
              {humanFileSize(item.size)}
            </Text>
          </View>
        </TouchableOpacity>
        {/**Item Action Button */}
        <View
          style={{
            ...styles.itemActionButton,
            backgroundColor: colors.background,
          }}
        >
          <TouchableOpacity onPress={() => setItemActionsOpen(true)}>
            <View style={styles.fileMenu}>
              {!isMultiSelect ? (
                <Feather
                  name="more-horizontal"
                  size={24}
                  color={colors.primary}
                />
              ) : selectedFile?.findIndex((it) => it.path === item.path) !==
                -1 ? (
                <Feather name="check-square" size={24} color={colors.primary} />
              ) : (
                <Feather name="square" size={24} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
