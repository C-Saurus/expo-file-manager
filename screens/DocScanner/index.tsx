import React, { useEffect, useState } from 'react';
import { View, Image, Button, TextInput, FlatList, Alert, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { createPdf } from 'react-native-images-to-pdf';
import { DocumentDirectoryPath } from 'react-native-fs';
import { styles } from './style';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { v4 as uuidv4 } from 'uuid';

export const DocScanner = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const generateUniquePdfName = () => `${uuidv4()}`;
  const [pdfName, setPdfName] = useState(generateUniquePdfName());
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scanDocument = async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument();

      if (!scannedImages || scannedImages.length === 0) {
        throw new Error('No images scanned');
      }

      setScannedImages(scannedImages);
      setIsPreviewMode(true);
    } catch (error) {
      Alert.alert('Error', `Failed to scan document: ${error.message}`);
    }
  };

  const savePdf = async () => {
    if (!pdfName.trim()) {
      Alert.alert('Error', 'Please enter a valid name for the PDF.');
      return;
    }
    try {
      createPdf({
        pages: scannedImages.map(imagePath => ({ imagePath })),
        outputPath: `${DocumentDirectoryPath}/${pdfName.trim()}.pdf`,
      });

      setScannedImages([]);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', `Failed to save PDF: ${error.message}`);
    }
  };

  useEffect(() => {
    scanDocument();
  }, []);

  if (isPreviewMode) {
    return (
      <View style={styles.container}>
        <FlatList
          data={scannedImages}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={{ alignItems: "center" }}>
              <Image
                style={styles.previewImage}
                source={{ uri: item }}
                resizeMode="cover"
              />
            </View>
          )}
        />

        <Text style={styles.label}>File name</Text>
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/icon_pdf.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            value={pdfName}
            onChangeText={setPdfName}
            placeholder="Enter PDF name"
          />
        </View>

        <TouchableOpacity
          style={[styles.button]}
          onPress={savePdf}>
          <Text style={[styles.buttonText]}>Save PDF</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View />
  );
};
