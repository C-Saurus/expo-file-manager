import React, { useState, useEffect } from 'react';
import { View, Text, Slider, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

const audioThumbnails = require('~/../../assets/audio-thubnails.jpg')

export default function AudioPlayer({ route }) {
  const [sound, setSound] = useState<Audio.Sound>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
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

  const handleRepeat = () => {
    if (isRepeat) {
      sound.setIsLoopingAsync(false);
      setIsRepeat(false);
    } else {
      sound.setIsLoopingAsync(true);
      setIsRepeat(true);
    }
  };

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
          source={require('../../assets/ic_pause.png')}
          style={styles.image}
        />
      </View>

      {/* Tên file */}
      <Text style={styles.fileName}>{route.params.filename}</Text>

      <View style={styles.progressBarContainer}>
        <Text style={styles.time}>{formatTime(position)}</Text>
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
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controlContainer}>
        <TouchableOpacity onPress={handleRepeat}>
          <Image
            source={isRepeat ? require('../../assets/ic_not_repeat.png') : require('../../assets/ic_repeat.png')}
            style={styles.iconRepeat}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playPauseHandler}>
          <Image
            source={isPlaying ? require('../../assets/ic_pause.png') : require('../../assets/ic_play.png')}
            style={styles.controlButton}
          />
        </TouchableOpacity>

        <TouchableOpacity >
          <Image
            source={require('../../assets/ic_option.png')}
            style={styles.iconRepeat}
          />
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    padding: 16
  },
  imageContainer: {
    marginTop: 150,
    marginBottom: 20
  },
  progressBarContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 160
  },
  controlContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 20
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 175,
    backgroundColor: 'red'
  },
  fileName: {
    fontSize: 18,
    color: '#fff',
    marginTop: 20
  },
  slider: {
    width: '80%',
    height: 40,
  },
  time: {
    fontSize: 14,
    color: '#fff',
  },
  controlButton: {
    width: 55,
    height: 55
  },
  iconRepeat: {
    width: 25,
    height: 25
  }
});
