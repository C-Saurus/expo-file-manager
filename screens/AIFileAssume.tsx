import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, ScrollView } from 'react-native';
import mammoth from 'mammoth';
import RNFS from 'react-native-fs';
import { useAppSelector } from '../hooks/reduxHooks';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

const AIFileSummarize = ({ route }) => {
  const { colors } = useAppSelector((state) => state.theme.theme);
  // const [isOnline, setIsOnline] = useState(true);
  const { filePath } = route.params;
  const [htmlContent, setHtmlContent] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  useEffect(() => {
    const genAI = new GoogleGenerativeAI("AIzaSyDRma76Lm6bRPUKo33DXpXRdRdx3hVy3Lg");
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('readFileAndSendToGemini', filePath);
    readFileAndSendToGemini(model);
  }, [filePath]);

  const bufferToArrayBuffer = (buffer: Buffer) => {
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  };

  const readFileAndSendToGemini = async (model: GenerativeModel) => {
    try {
      setLoading(true);
      const fileContent = await RNFS.readFile(filePath, 'base64');

      // Chuyển đổi base64 về dạng buffer
      const buffer = Buffer.from(fileContent, 'base64');

      // Dùng mammoth để chuyển đổi buffer thành text
      const arrayBuffer = bufferToArrayBuffer(buffer); // Chuyển đổi thành ArrayBuffer
      const result = await mammoth.convertToHtml({
        arrayBuffer: arrayBuffer as ArrayBuffer,
      });
      const response = await model.generateContent([
        `Hãy đọc và phân tích nội dung sau. Vui lòng thực hiện các nhiệm vụ sau đây:
          1. Tóm tắt nội dung chính trong **tối đa ${Math.min(result.value.length / 4, 40)} từ**, ngắn gọn và xúc tích.
          2. Liệt kê 3-6 ý chính dưới dạng gạch đầu dòng -, mỗi ý trên một dòng, không sử dụng thêm ký tự như * hoặc **.
          3. Thực hiện một phân tích sâu dựa trên nội dung, làm rõ các vấn đề nổi bật, câu hỏi mở hoặc ý nghĩa quan trọng.

          **Lưu ý:** 
          - Sử dụng ngữ pháp, dấu câu và cấu trúc rõ ràng.
          - Kết quả phải xuống dòng chính xác và được định dạng rõ ràng, không sử dụng các ký tự không cần thiết như * hoặc **.
          - Định dạng kết quả sao cho có thể hiển thị trực tiếp trên thẻ **Text** (chỉ cần nội dung chứ không cần trả về cả thẻ) trong React Native.
          - Mỗi ý chính hoặc phần tóm tắt phải dễ đọc, bố cục trình bày giống một tài liệu chuẩn.`,
        result.value,
      ]);

      console.log(JSON.stringify(response));
      setHtmlContent(response.response.candidates[0].content.parts[0].text)
    } catch (error) {
      setHtmlContent(`Đã có lỗi xảy ra, chi tiết như sau:\n ${error}`)
      console.error(error);
    } finally {
      setLoading(false)
    }
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
    <ScrollView style={{ flex: 1,
      backgroundColor: colors.background2 }}>
      <Text>{htmlContent}</Text>
    </ScrollView>
  );
};

export default AIFileSummarize;
