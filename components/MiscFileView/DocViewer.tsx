import React, { useState, useEffect } from 'react';
import { View, Linking, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import mammoth from 'mammoth';
import RNFS from 'react-native-fs';
import { useAppSelector } from '../../hooks/reduxHooks';

const DocViewer = ({ filePath }) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  // const [isOnline, setIsOnline] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    setLoading(true);
    // const checkConnectivity = async () => {
    //   const state = await NetInfo.fetch();
    //   setIsOnline(state.isConnected); // Cập nhật trạng thái kết nối mạng
    // };

    // checkConnectivity(); // Kiểm tra kết nối mạng khi component mount

    if (filePath.endsWith('.docx')) {
      convertDocxToHtml(filePath);
    } else {
      openFileWithExternalApp(filePath);
    }
  }, [filePath]); // Dependency array rỗng, chỉ chạy một lần khi component mount

  const bufferToArrayBuffer = (buffer: Buffer) => {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  };

  const convertDocxToHtml = (filePath: string) => {
    console.log('filePath', filePath);
    RNFS.readFile(filePath, 'base64')
      .then((base64Data) => {
        const buffer = Buffer.from(base64Data, 'base64');
        const arrayBuffer = bufferToArrayBuffer(buffer); // Chuyển đổi thành ArrayBuffer
        return mammoth.convertToHtml({
          arrayBuffer: arrayBuffer as ArrayBuffer,
        });
      })
      .then((result) => {
        setHtmlContent(result.value);
      })
      .catch((error) => {
        console.error('Error loading DOCX file:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Mở file DOC bằng ứng dụng bên ngoài
  const openFileWithExternalApp = (filePath: string) => {
    Linking.openURL(`file://${filePath}`)
      .catch((err) => console.error('Failed to open file:', err))
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background2,
          width: '100%',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default DocViewer;
