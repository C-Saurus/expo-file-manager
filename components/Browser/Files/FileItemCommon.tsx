import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, Image, TouchableOpacity, Alert } from 'react-native';
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
import { Checkbox } from 'react-native-paper';

type Props = {
  item: ReadDirItem;
  multiSelect: boolean;
  selectAll: boolean;
  toggleSelect: (
    arg0: ReadDirItem,
    arg1?: boolean
  ) => void;
  setTransferDialog: (arg0: boolean) => void;
  setMoveOrCopy: (arg0: string) => void;
  setRenamingFile: (arg0: ReadDirItem) => void;
  setRenameDialogVisible: (arg0: boolean) => void;
  setNewFileName: (arg0: string) => void;
  deleteSelectedFiles: (arg0?: ReadDirItem) => void;
};

export const FileItemCommon: React.FC<Props> = React.memo(({
  item,
  multiSelect,
  selectAll,
  toggleSelect,
  setTransferDialog,
  setMoveOrCopy,
  setRenamingFile,
  setRenameDialogVisible,
  setNewFileName,
  deleteSelectedFiles,
}) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [itemActionsOpen, setItemActionsOpen] = useState(false);
  const itemMime = mime.lookup(item.path) || ' ';
  const itemType: string = item.isDirectory ? 'dir' : itemMime.split('/')[0];
  const itemFormat: string = item.isDirectory ? 'dir' : itemMime.split('/')[1];
  const [selected, setSelected] = useState(false)

  const ThumbnailImage = useCallback(({ uri }) => {
    return <Image style={styles.image} source={{ uri: `file://${uri}` }} />;
  }, [])

  const ItemThumbnail = useCallback(() => {
    switch (itemType) {
      case 'dir':
        return <Feather name="folder" size={35} color={colors.text} />;
      case 'image':
      case 'video':
        return <ThumbnailImage uri={item.path} />;
      case 'audio':
        return (
          <FontAwesome5 name="file-audio" size={35} color={colors.text} />
        );
      case 'font':
        return <FontAwesome5 name="font" size={35} color={colors.text} />;
      case 'application':
        return (
          <MaterialCommunityIcons
            name={fileIcons[itemFormat] || 'file-outline'}
            size={35}
            color={colors.text}
          />
        );
      case 'text':
        return (
          <MaterialCommunityIcons
            name={fileIcons[itemFormat] || 'file-outline'}
            size={35}
            color={colors.text}
          />
        );
      default:
        return <Feather name="file" size={35} color={colors.text} />;
    }
  }, [colors])

  const onPressHandler = () => {
    console.log('multiSelect', multiSelect);
    if (!multiSelect) {
      if (itemType === 'image') {
        navigation.push('ImageGalleryView', {
          folderName: item.name,
          prevDir: ``,
          uriValue: `file://${item.path}`,
        });
      } else if (itemType === 'video') {
        navigation.push('VideoPlayer', {
          folderName: item.name,
          prevDir: ``,
          uriValue: `file://${item.path}`,
        });
      } else if (itemType === 'audio') {
        navigation.push('AudioPlayer', {
          folderName: item.name,
          prevDir: ``,
          uriValue: `file://${item.path}`,
        });
      } else {
        navigation.push('MiscFileView', {
          folderName: item.path,
        });
      }
    } else {
      toggleSelect(item);
      setSelected((prev) => !prev)
    }
  };

  const renderItemContent = useMemo(
    () => (
      <TouchableOpacity
        style={styles.itemLeft}
        activeOpacity={0.5}
        onPress={onPressHandler}
        onLongPress={() => {
          console.log('onLongPress', multiSelect);
          setSelected(true);
          toggleSelect(item, true);
        }}
      >
        <View style={styles.itemThumbnail}>
          {itemType && <ItemThumbnail />}
        </View>
        <View style={styles.itemDetails}>
          <Text
            numberOfLines={1}
            style={{ ...styles.fileName, color: colors.text }}
          >
            {decodeURI(item.name)}
          </Text>
          <Text style={{ ...styles.fileDetailText, color: colors.primary }}>
            {humanFileSize(item.size)}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <ActionSheet
        title={
          multiSelect
            ? 'Choose an action for the selected items'
            : decodeURI(item.name)
        }
        numberOfLinesTitle={multiSelect ? undefined : 1}
        visible={itemActionsOpen}
        actionItems={[
          'Rename',
          'Copy',
          'Move',
          'Share',
          'Delete',
          'Summarize',
          'Cancel',
        ]}
        itemIcons={[
          'edit',
          'file-copy',
          'drive-file-move',
          'share',
          'delete',
          'flash-on',
          'close',
        ]}
        onClose={setItemActionsOpen}
        onItemPressed={(buttonIndex) => {
          if (buttonIndex === 5) {
            navigation.push('AIFileSummarize', {
              filePath: item.path,
            });
          }
          if (buttonIndex === 4) {
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
                      if (!multiSelect) deleteSelectedFiles(item);
                      else deleteSelectedFiles();
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
            if (!multiSelect) {
              toggleSelect(item);
              setSelected((prev) => !prev)
            }
            setMoveOrCopy('Move');
            setTransferDialog(true);
            console.log('setTransferDialog');
          } else if (buttonIndex === 1) {
            if (!multiSelect) {
              toggleSelect(item);
              setSelected((prev) => !prev)
            }
            setMoveOrCopy('Copy');
            setTransferDialog(true);
          } else if (buttonIndex === 0) {
            setRenamingFile(item);
            setRenameDialogVisible(true);
            setNewFileName(item.name);
          }
        }}
        cancelButtonIndex={6}
        modalStyle={{ backgroundColor: colors.background2 }}
        itemTextStyle={{ color: colors.text }}
        titleStyle={{ color: colors.secondary }}
      />
      <View style={styles.itemContainer}>
        {renderItemContent}
        {/**Item Action Button */}
        <View
          style={{
            ...styles.itemActionButton,
            backgroundColor: colors.background,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              !multiSelect && setItemActionsOpen(true)
            }}
          >
            <View style={styles.fileMenu}>
              {!multiSelect ? (
                <Feather
                  name="more-horizontal"
                  size={24}
                  color={colors.primary}
                />
              ) : 
              (
                <Checkbox
                  color={colors.primary}
                  status={selected || selectAll ? 'checked' : 'unchecked'}
                  onPress={() => {
                    toggleSelect(item)
                    setSelected((prev) => !prev)
                  }}
                  uncheckedColor={colors.primary}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
})
