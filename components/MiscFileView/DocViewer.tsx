import React, { useState, useEffect } from 'react';
import { View, Button, Linking } from 'react-native';
import WebView from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo'; // Sử dụng @react-native-community/netinfo
import mammoth from 'mammoth';

const DocViewer = ({ filePath }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Kiểm tra kết nối mạng một lần khi component được gọi
    const checkConnectivity = async () => {
      const state = await NetInfo.fetch();
      setIsOnline(state.isConnected); // Cập nhật trạng thái kết nối mạng
    };

    checkConnectivity(); // Kiểm tra kết nối mạng khi component mount

    // Nếu là file DOCX và offline, chuyển đổi sang HTML
    if (!isOnline && filePath.endsWith('.docx')) {
      convertDocxToHtml(filePath);
    }

  }, [filePath]); // Dependency array rỗng, chỉ chạy một lần khi component mount

  // Chuyển đổi file DOCX sang HTML
  const convertDocxToHtml = (filePath) => {
    mammoth.convertToHtml({ path: filePath })
      .then((result) => {
        setHtmlContent(result.value);
      })
      .catch((error) => {
        console.error("Error converting DOCX to HTML", error);
      });
  };

  // Kiểm tra file là DOC hay DOCX để xử lý
  const handleFileOpen = async (filePath) => {
    const fileExtension = filePath.split('.').pop().toLowerCase();
    
    if (fileExtension === 'docx') {
      if (isOnline) {
        // Nếu online, mở file trên Google Docs
        openFileOnGoogleDocs(filePath);
      } else {
        // Nếu offline, hiển thị file DOCX đã chuyển sang HTML
        renderHtmlContent();
      }
    } else if (fileExtension === 'doc') {
      // Nếu là file DOC, sử dụng Linking để mở bằng ứng dụng ngoài
      openFileWithExternalApp(filePath);
    } else {
      console.log('Unsupported file format');
    }
  };

  // Mở file DOCX trên Google Docs
  const openFileOnGoogleDocs = (filePath) => {
    const fileUrl = `https://docs.google.com/gview?embedded=true&url=file://${filePath}`;
    return (
      <WebView
        source={{ uri: fileUrl }}
        style={{ flex: 1 }}
      />
    );
  };

  // Hiển thị file DOCX đã chuyển đổi sang HTML
  const renderHtmlContent = () => {
    return (
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
      />
    );
  };

  // Mở file DOC bằng ứng dụng bên ngoài
  const openFileWithExternalApp = (filePath) => {
    Linking.openURL(`file://${filePath}`).catch((err) => console.error('Failed to open file:', err));
  };

  return (
    <View style={{ flex: 1 }}>
      <Button
        title="Open Document"
        onPress={() => handleFileOpen(filePath)}
      />
    </View>
  );
};

export default DocViewer;
