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

const fileTypes = [
  {
    id: '1',
    type: 'Image',
    icon: 'image-outline',
    color: '#FF6F61',
    description: 'View your images',
  },
  {
    id: '2',
    type: 'Video',
    icon: 'videocam-outline',
    color: '#FFD54F',
    description: 'Explore videos',
  },
  {
    id: '3',
    type: 'Audio',
    icon: 'musical-notes-outline',
    color: '#4CAF50',
    description: 'Listen to your audio files',
  },
  {
    id: '4',
    type: 'PDF',
    icon: 'document-text-outline',
    color: '#42A5F5',
    description: 'Manage your PDFs',
  },
  {
    id: '5',
    type: 'Doc',
    icon: 'document-outline',
    color: '#AB47BC',
    description: 'Access Word documents',
  },
];

const MenuScreen = ({ navigation }) => {
  const handlePress = (type) => {
    alert(`You selected ${type}!`);
    // navigation.navigate('FileTypeScreen', { fileType: type });
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
