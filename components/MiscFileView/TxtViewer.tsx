import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import RNFS from 'react-native-fs';
import { useAppSelector } from '../../hooks/reduxHooks';

const TxtViewer = ({ filePath }) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Đọc file txt khi component được mount
  useEffect(() => {
    RNFS.readFile(filePath, 'utf8')
      .then((data) => {
        setContent(data); // Lưu nội dung của file
      })
      .catch((error) => console.error('Error reading file:', error));
  }, [filePath]);

  // Lưu nội dung vào file khi người dùng chỉnh sửa
  const saveContent = () => {
    RNFS.writeFile(filePath, content, 'utf8')
      .then(() => {
        console.log('File saved successfully');
        setIsEditing(false); // Quay lại chế độ view sau khi lưu
      })
      .catch((error) => console.error('Error saving file:', error));
  };

  // UI cho chế độ view và chỉnh sửa
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background2,
        width: '100%',
        padding: 20,
      }}
    >
      {/* Thanh điều hướng */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>File Viewer</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text style={{ color: 'blue' }}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung file txt */}
      {isEditing ? (
        <TextInput
          multiline
          value={content}
          onChangeText={setContent} // Cập nhật nội dung khi người dùng chỉnh sửa
          style={{
            height: 200,
            borderColor: 'gray',
            borderWidth: 1,
            padding: 10,
            textAlignVertical: 'top',
          }}
        />
      ) : (
        <ScrollView>
          <Text style={{ fontSize: 16 }}>{content}</Text>
        </ScrollView>
      )}

      {/* Nút Save để lưu file */}
      {isEditing && <Button title="Save" onPress={saveContent} />}
    </View>
  );
};

export default TxtViewer;
