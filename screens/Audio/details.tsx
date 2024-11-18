import React, { useState, useEffect } from 'react';
import { View, Text, Slider, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

const audioThumbnails = require('~/../../assets/audio-thubnails.jpg')
export default function AudioPlayer({ route }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: route.params.uri },
          { shouldPlay: false }
        );
        setSound(sound);

        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis);
        }
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [route.params.uri]);

  const playPauseHandler = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);

      // Cập nhật vị trí khi phát
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
        }
      });
    }
  };

  const onSlidingComplete = async (value) => {
    if (sound) {
      const newPosition = value * duration; // Giá trị thanh trượt tỉ lệ (0 - 1) nhân với tổng thời gian
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hình ảnh trung tâm */}
      <View style={styles.imageContainer}>
        <Image
          source={audioThumbnails} // Thay bằng hình ảnh của bạn
          style={styles.image}
        />
      </View>

      {/* Tên file */}
      <Text style={styles.fileName}>{route.params.filename}</Text>

      {/* Thanh trượt */}
      <Slider
        style={styles.slider}
        value={position / duration || 0} // Giá trị từ 0 - 1
        onSlidingComplete={onSlidingComplete}
        minimumValue={0}
        maximumValue={1}
        thumbTintColor="#fff"
        minimumTrackTintColor="#ff5722"
        maximumTrackTintColor="#757575"
      />

      {/* Thời gian */}
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      {/* Nút điều khiển */}
      <TouchableOpacity style={styles.controlButton} onPress={playPauseHandler}>
        <Text style={styles.controlText}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const formatTime = (millis) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  fileName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  slider: {
    width: '80%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  time: {
    fontSize: 14,
    color: '#fff',
  },
  controlButton: {
    padding: 10,
    backgroundColor: '#ff5722',
    borderRadius: 5,
  },
  controlText: {
    color: '#fff',
    fontSize: 16,
  },
});
