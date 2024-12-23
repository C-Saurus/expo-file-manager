import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LOCAL_FOLDER } from '../../utils/Constants';
import { LOCAL_EXPO_FOLDER } from '../../utils/ExpoFileConstant';

const fileTypes = [
  {
    id: '1',
    type: 'Image',
    icon: 'image-outline', // Icon phù hợp cho ảnh
    color: '#FF7043', // Màu cam sáng, tượng trưng cho hình ảnh
    description: 'View your images',
  },
  {
    id: '2',
    type: 'Video',
    icon: 'videocam-outline', // Icon phù hợp cho video
    color: '#FFA726', // Màu cam nhạt, gợi nhớ đến ánh sáng từ video
    description: 'Explore videos',
  },
  {
    id: '3',
    type: 'Audio',
    icon: 'musical-notes-outline', // Icon nốt nhạc
    color: '#66BB6A', // Màu xanh lá, gợi cảm giác tươi mới và sống động
    description: 'Listen to your audio files',
  },
  {
    id: '4',
    type: 'Pdf',
    icon: 'document-text-outline', // Icon văn bản cho PDF
    color: '#29B6F6', // Màu xanh dương, quen thuộc với PDF
    description: 'Manage your PDFs',
  },
  {
    id: '5',
    type: 'Doc',
    icon: 'document-outline', // Icon tài liệu, phù hợp với Word
    color: '#8E24AA', // Màu tím, tương đồng với Microsoft Word
    description: 'Access Word documents',
  },
  {
    id: '6',
    type: 'Txt',
    icon: 'clipboard-outline', // Icon clipboard, tượng trưng cho text file
    color: '#546E7A', // Màu xám xanh, nhẹ nhàng và trung tính
    description: 'Manage text files',
  },
  {
    id: '7',
    type: 'Excel-Csv',
    icon: 'grid-outline', // Icon lưới, phù hợp với bảng tính
    color: '#FFD54F', // Màu vàng, thường liên kết với dữ liệu bảng tính
    description: 'Access Excel/CSV files',
  },
];

const MenuScreen = ({ navigation }) => {
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
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    margin: 10,
    height: Dimensions.get('window').width / 2.5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default MenuScreen;
