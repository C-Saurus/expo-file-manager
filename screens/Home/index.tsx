import { FlatList, Image, LogBox, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import RNFS, { FSInfoResult, ReadDirItem } from 'react-native-fs';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { StorageData } from '../../constants/interface';
import { ENFILETYPE } from '../../constants/enum';
import { styles } from './style';
import { bytesToGB } from '../../utils/Filesize';
import { DATA, DATA_FOLDER } from '../../constants/const';
import { ScrollView } from 'react-native-gesture-handler';

export const Home = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [storageInfo, setStorageInfo] = useState<
    FSInfoResult & { usedSpace: number }
  >({
    totalSpace: 0,
    freeSpace: 0,
    usedSpace: 0,
  });

  useEffect(() => {
    getStorageInfo();
  }, []);

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  const getStorageInfo = async () => {
    try {
      const fsInfo = await RNFS.getFSInfo();
      const { totalSpace, freeSpace } = fsInfo;
      const usedSpace = totalSpace - freeSpace;
      setStorageInfo({
        totalSpace,
        freeSpace,
        usedSpace,
      });
    } catch (error) {
      console.error('Error fetching storage info: ', error);
    }
  };

  const handleFilePress = (item: any) => {
    console.log('handleFilePress', item.id);
    switch (item.id) {
      case 0:
      case 1:
        navigation.navigate('LargeFilesScanner', {
          mode: item?.id,
        });
        break;
      case 2:
        navigation.navigate('TrashScreen');
        break;
      case 3:
        navigation.navigate('DocScanner');
        break;
      default:
        break;
    }
  };

  const handleFileCateogory = (item: any) => {
    switch (Number(item.id)) {
      case ENFILETYPE.IMAGE:
        navigation.navigate('ImageScreen', {
          fileType: 'photo',
        });
        break;
      case ENFILETYPE.VIDEO:
        navigation.navigate('ImageScreen', {
          fileType: 'video',
        });
        break;
      case ENFILETYPE.PDF:
        navigation.navigate('PDFScreen');
        break;
      case ENFILETYPE.AUDIO:
        navigation.navigate('ImageScreen', {
          fileType: 'audio',
        });
        break;
      case ENFILETYPE.DOCUMENT:
        navigation.navigate('DocumentScreen');
        break;
      case ENFILETYPE.APP:
        navigation.navigate('ApkScreen');
        break;
      case ENFILETYPE.ZIP:
        navigation.navigate('ZipScreen');
        break;
      default:
        break;
    }
  };

  const handleFolderCateogory = (item: any) => {
    console.log("item",item)
    switch (Number(item.id)) {
      case ENFILETYPE.IMAGE:
        navigation.navigate('ImageScreen');
        break;
      case ENFILETYPE.VIDEO:
        navigation.navigate('VideoScreen');
        break;
      case ENFILETYPE.PDF:
        navigation.navigate('PDFScreen');
        break;
      case ENFILETYPE.AUDIO:
        navigation.navigate('AudioScreen');
        break;
      case ENFILETYPE.DOCUMENT:
        navigation.navigate('DocumentScreen');
        break;
      default:
        break;
    }
  };

  const DATATOOL = [
    {
      id: 0,
      title: 'Tệp lớn',
      icon: 'insert-drive-file',
      iconLib: 'MaterialIcons',
      background: '#f0f2f7',
      color: '#537ad4',
    },
    {
      id: 1,
      title: 'Filter Duplicate',
      icon: 'filter',
      iconLib: 'MaterialIcons',
      background: '#ebf7f7',
      color: '#5ff0f0',
    },
    {
      id: 2,
      title: 'TrashScreen',
      icon: 'trash',
      iconLib: 'FontAwesome5',
      background: '#f7f0f4',
      color: '#d85090',
    },
    {
      id: 3,
      title: 'DocScanner',
      icon: 'expand',
      iconLib: 'FontAwesome5',
      background: '#faf5ed',
      color: '#d69c31',
    },
  ];

  const renderIcon = (item) => {
    switch (item.iconLib) {
      case 'MaterialIcons':
        return <MaterialIcons name={item.icon} size={40} color={item.color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={item.icon} size={40} color={item.color} />;
      case 'Ionicons':
        return <Ionicons name={item.icon} size={40} color={item.color} />;
      default:
        return null;
    }
  };
  const renderToolItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleFilePress(item)}>
      <View style={[styles.toolItemContainer, { backgroundColor: item.background }]}>
        {renderIcon(item)}
        <Text style={styles.toolTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleFileCateogory(item)}>
        <View style={styles.itemContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={item.icon} size={35} color={item.color} />
          </View>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItemFolder = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleFolderCateogory(item)}>
        <View style={styles.itemContainer}>
          <MaterialIcons name={item.icon} size={30} color="#6200ea" />
          <Text style={styles.title}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
      <View style={styles.container}>
        <View style={styles.memoryContainer}>
          <View>
            <Text style={styles.memoryText}>Lưu trữ nội bộ</Text>
            <Text style={styles.memoryUsage}>
              {bytesToGB(storageInfo?.usedSpace)} /{' '}
              {bytesToGB(storageInfo?.totalSpace)} GB
            </Text>
          </View>
          <Progress.Circle
            size={70}
            progress={
              storageInfo.totalSpace > 0
                ? storageInfo?.usedSpace / storageInfo?.totalSpace
                : 0
            }
            showsText={true}
            formatText={() =>
              `${(
                (storageInfo?.usedSpace / storageInfo?.totalSpace) *
                100
              ).toFixed(0)}%`
            }
            color="black"
            unfilledColor="#ecedee"
            borderWidth={0}
            thickness={5}
          />
        </View>

        <FlatList
          style={{ padding: 8 }}
          data={DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={4}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.listToolContainer}>
          <Text style={styles.header}>Công cụ</Text>
          <FlatList
            data={DATATOOL}
            renderItem={renderToolItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        {/* TODO: impliment in another tab */}
        {/* 
        <View style={styles.listItemContainerFolder}>
          <Text style={styles.header}>Folder của tôi</Text>
          <FlatList
            data={DATA_FOLDER}
            renderItem={renderItemFolder}
            keyExtractor={(item) => item.id}
            numColumns={4}
            columnWrapperStyle={styles.row}
            scrollEnabled={false}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        </View> */}
      </View>
  );
};
