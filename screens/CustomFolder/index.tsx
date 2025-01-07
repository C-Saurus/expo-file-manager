import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LOCAL_EXPO_FOLDER } from '../../utils/ExpoFileConstant';
import { useAppSelector } from '../../hooks/reduxHooks';
import { styles } from './style';

const fileTypes = [
  {
    id: '1',
    type: 'Image',
    icon: 'image-outline',
    color: '#FF7043',
    description: 'View your images',
  },
  {
    id: '2',
    type: 'Video',
    icon: 'videocam-outline',
    color: '#FFA726',
    description: 'Explore videos',
  },
  {
    id: '3',
    type: 'Audio',
    icon: 'musical-notes-outline',
    color: '#66BB6A',
    description: 'Listen to audio files',
  },
  {
    id: '4',
    type: 'Pdf',
    icon: 'document-text-outline',
    color: '#29B6F6',
    description: 'Manage PDF files',
  },
  {
    id: '5',
    type: 'Word',
    icon: 'document-outline',
    color: '#8E24AA',
    description: 'Access Word documents',
  },
  {
    id: '6',
    type: 'Txt',
    icon: 'clipboard-outline',
    color: '#546E7A',
    description: 'Handle text files',
  },
  {
    id: '7',
    type: 'Excel/CSV',
    icon: 'grid-outline',
    color: '#FFD54F',
    description: 'Work with Excel/CSV files',
  },
  {
    id: '8',
    type: 'Custom',
    icon: 'cube-outline',
    color: 'gray',
    description: 'Your custom files',
  },
];


const MenuScreen = ({ navigation }) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const handlePress = (type: string) => {
    navigation.navigate('Browser', {
      folderName: type,
      prevDir: `${LOCAL_EXPO_FOLDER}${type}`,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: item.color }]}
      onPress={() => handlePress(item.type)}
    >
      <Ionicons name={item.icon} size={40} color="#fff" />
      <Text style={styles.cardTitle}>{item.type}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={fileTypes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};
export default MenuScreen;
