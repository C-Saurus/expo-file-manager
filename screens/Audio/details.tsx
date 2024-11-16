import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { Audio } from 'expo-av';

const AudioPlayer = ({ route }) => {
  console.log("route", route)
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newPosition = Math.max(0, Math.min(sliderWidth, gestureState.dx));
        const newTime = Math.round((newPosition / sliderWidth) * duration);
        setCurrentTime(newTime);
        sound && sound.setPositionAsync(newTime * 1000);
      },
    })
  ).current;

  // Load âm thanh
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: route.params.uri },
          { shouldPlay: false }
        );
        setSound(sound);
  
        // Lấy thông tin âm thanh
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis / 1000); // Thời gian phát (giây)
        } else {
          console.warn('Sound not loaded successfully');
        }
      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };
  
    loadSound();
  
    return () => {
      sound && sound.unloadAsync();
    };
  }, [route.params.uri]);

  // Cập nhật trạng thái
  useEffect(() => {
    if (!sound) return;

    const updateStatus = async () => {
      const status = await sound.getStatusAsync();
      setCurrentTime(status.positionMillis / 1000); // Thời gian hiện tại (giây)
    };

    const interval = setInterval(updateStatus, 500); // Cập nhật trạng thái mỗi 500ms
    return () => clearInterval(interval);
  }, [sound]);

  const togglePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      {/* Hiển thị tên file */}
      <Text style={styles.fileName}>{route.params.filename || 'Unknown File'}</Text>

      {/* Thanh trượt */}
      <View
        style={styles.slider}
        onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
      >
        <View
          style={[
            styles.progress,
            { width: `${(currentTime / duration) * 100}%` },
          ]}
        />
        <View
          style={[
            styles.thumb,
            { left: `${(currentTime / duration) * 100}%` },
          ]}
          {...panResponder.panHandlers}
        />
      </View>

      {/* Hiển thị thời gian */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Nút Play / Pause */}
      <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
        <Text style={styles.playButtonText}>
          {isPlaying ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#fff',
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
  },
  playButton: {
    backgroundColor: '#b3e5fc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AudioPlayer;
