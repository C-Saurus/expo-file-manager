import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const FullScreenImageScreen = ({ route, navigation }) => {
  const { uri } = route.params;
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: uri }}
        style={styles.fullScreenImage}
        resizeMode="contain"
      />
    </View>
  );
};

export default FullScreenImageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
