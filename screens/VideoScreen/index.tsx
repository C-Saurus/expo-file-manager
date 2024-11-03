import React, { useEffect, useState } from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { styles } from './style';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export const VideoScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Video');
  return (
    <View style={styles.containerNav}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Video</Text>
      </View>
      {/* <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'Hình ảnh' ? styles.activeTab : null,
            ]}
            onPress={() => setSelectedTab('Hình ảnh')}
          >
            <Text style={styles.tabText}>Hình ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'Album' ? styles.activeTab : null,
            ]}
            onPress={() => setSelectedTab('Album')}
          >
            <Text style={styles.tabText}>Album</Text>
          </TouchableOpacity>
        </View> */}
      <VideoGrid />
    </View>
  );
};

export const VideoGrid = () => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [videos, setVideos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const media = await MediaLibrary.getAssetsAsync({
          mediaType: 'video',
          first: 100,
        });
        setVideos(media.assets);
      }
      setLoading(false);
    })();
  }, []);

  const playVideo = (item) => {
    navigation.push('VideoPlayer', {
        folderName: "",
        prevDir: "",
        uriValue: item.uri
      });
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => playVideo(item)}>
        <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.uri }}
        style={styles.thumbnail}
      />
      <Text style={styles.filename}>{item.filename}</Text>
    </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={{
          ...styles.container,
          backgroundColor: colors.background2,
          width: '100%',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={3} // Hiển thị 3 cột
      contentContainerStyle={styles.list}
    />
  );
};
