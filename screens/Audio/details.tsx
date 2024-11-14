import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

const AudioDetail = ({ audioFile }) => {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);

  const playPauseAudio = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioFile.uri });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.filename}>{audioFile.filename}</Text>
      <Button title={isPlaying ? 'Pause' : 'Play'} onPress={playPauseAudio} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  filename: { fontSize: 18, marginBottom: 16 },
});

export default AudioDetail;
