import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  Button,
  TextInput,
  FlatList,
  Alert,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { createPdf } from 'react-native-images-to-pdf';
import { DocumentDirectoryPath } from 'react-native-fs';
import { styles } from './style';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { v4 as uuidv4 } from 'uuid';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useAppSelector } from '../../hooks/reduxHooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RNFS from "react-native-fs"

export const DocScanner = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { top } = useSafeAreaInsets();
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const generateUniquePdfName = () => `${uuidv4()}`;
  const [pdfName, setPdfName] = useState(generateUniquePdfName());
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android' && await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      ) !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Error', 'User must grant camera permissions to use document scanner.')
        setHasPermission(false)
        return
      }
      setHasPermission(true)
    })();
  }, []);

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
        pages: scannedImages.map((imagePath) => ({ imagePath })),
        outputPath: `${RNFS.DocumentDirectoryPath}/Pdf/${pdfName.trim()}.pdf`,
      });

      setScannedImages([]);
      Toast.show({
        text1: `File đã được lưu ở Pdf/${pdfName.trim()}.pdf`,
        autoHide: true,
        type: 'success'
      })
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', `Failed to save PDF: ${error.message}`);
    }
  };

  if (!hasPermission && hasPermission !== null)
    return (
      <View
        style={{
          ...styles.noAccessContainer,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ ...styles.noAccessText, color: colors.primary }}>
          {'Camera Access Denied'}
        </Text>
        <Button title="Go to Settings" onPress={() => Linking.openSettings()} />
      </View>
    );

  return (
    <View style={[styles.container, {
      paddingTop: top,
      backgroundColor: colors.background,
    }]}>
      {isPreviewMode && (
        <FlatList
          data={scannedImages}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.previewItemContainer}>
              <Image
                style={styles.previewImage}
                source={{ uri: item }}
                resizeMode="cover"
              />
            </View>
          )}
        />
      )}

      {!isPreviewMode && (
        <View style={styles.scanButtonContainer}>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: colors.primary }]}
            onPress={scanDocument}
          >
            <Text style={styles.scanButtonText}>Scan</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPreviewMode && (
        <>
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

          <TouchableOpacity style={[styles.button]} onPress={savePdf}>
            <Text style={[styles.buttonText]}>Save PDF</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
