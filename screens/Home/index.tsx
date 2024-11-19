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

  const [loading, setLoading] = useState(false);

  const [storageData, setStorageData] = useState<StorageData>({
    image: 0,
    video: 0,
    audio: 0,
    pdf: 0,
    app: 0,
    zip: 0,
    document: 0,
    download: 0,
  });

  useEffect(() => {
    getStorageInfo();
  }, []);

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
 }, []); 

  const getDirectorySize = async (
    directoryPath: string,
    fileTypes: string[]
  ): Promise<number> => {
    try {
      const files: ReadDirItem[] = await RNFS.readDir(directoryPath);
      let totalSize = 0;

      for (const file of files) {
        if (file.isFile()) {
          console.log('file', file);
          const extension = file.name.split('.').pop()?.toLowerCase();
          if (extension && fileTypes.includes(extension)) {
            totalSize += file.size;
          }
        }
      }
      return totalSize;
    } catch (error) {
      console.error(`Error getting size for ${directoryPath}:`, error);
      return 0;
    }
  };

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
    console.log('item', item.id);
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

  const handleFolderCateogory = (item: any) => {
    console.log('item', item.id);
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
      color: '#bbdefb',
    },
    {
      id: 1,
      title: 'Filter Duplicate',
      icon: 'filter',
      iconLib: 'MaterialIcons',
      color: '#b3e5fc',
    },
    {
      id: 2,
      title: 'TrashScreen',
      icon: 'trash',
      iconLib: 'FontAwesome5',
      color: '#ffcdd2',
    },
    {
      id: 3,
      title: 'DocScanner',
      icon: 'expand',
      iconLib: 'FontAwesome5',
      color: '#ffcdd2',
    },
  ];

  const renderIcon = (item) => {
    switch (item.iconLib) {
      case 'MaterialIcons':
        return <MaterialIcons name={item.icon} size={40} color="#6200ea" />;
      case 'FontAwesome5':
        return <FontAwesome5 name={item.icon} size={40} color="#6200ea" />;
      case 'Ionicons':
        return <Ionicons name={item.icon} size={40} color="#6200ea" />;
      default:
        return null;
    }
  };
  const renderToolItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleFilePress(item)}>
      <View style={[styles.toolItemContainer, { backgroundColor: item.color }]}>
        {renderIcon(item)}
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleFileCateogory(item)}>
        <View style={styles.itemContainer}>
          <MaterialIcons name={item.icon} size={30} color="#6200ea" />
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
    <ScrollView nestedScrollEnabled={true}>
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
            color="#6c5ce7"
            borderWidth={0}
            thickness={8}
          />
        </View>

        {/* Icon List */}
        <View style={styles.listItemContainer}>
          <FlatList
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
        </View>

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
        </View>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <View style={styles.listToolContainer}>
            <Text style={styles.header}>Công cụ</Text>
            <FlatList
              data={DATATOOL}
              renderItem={renderToolItem}
              keyExtractor={(item) => item.id}
              numColumns={1}
              scrollEnabled={false}
              horizontal={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};
