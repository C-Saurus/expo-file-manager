import RNFS from 'react-native-fs';
import { ENFILETYPE } from '../constants/enum';

const documentExtensions = {
  doc: ['doc', 'docx'],
  txt: ['txt'],
  csvExcel: ['csv', 'xls', 'xlsx'],
  others: ['ppt', 'pptx', 'rtf', 'odt', 'ods', 'odp'], // Bất kỳ định dạng tài liệu nào khác
};

const appExtensions = ['apk']

const zipExtensions = ['zip', 'rar']

const isNotDocument = (ext: string) => {
  const documentExtensions = [
    'doc', 'docx', // Word
    'txt',         // Plain text
    'pdf',         // PDF
    'xls', 'xlsx', // Excel
    'csv',         // CSV
    'ppt', 'pptx', // PowerPoint
    'rtf',         // Rich Text Format
    'odt', 'ods', 'odp', // OpenDocument formats
    //'xml', 'json', 'yaml', 'js', // Program
  ];

  return !documentExtensions.includes(ext); 
}

export const getDocumentFiles = async () => {
  const categorizedFiles = {
    docFiles: [],
    txtFiles: [],
    csvExcelFiles: [],
    otherFiles: [],
  };

  const rootPath = '/storage/emulated/0'; // Thư mục gốc trên Android
  const directoriesToScan = [rootPath];

  try {
    while (directoriesToScan.length > 0) {
      const currentDir = directoriesToScan.pop();
      const items = await RNFS.readDir(currentDir); // Đọc nội dung thư mục

      for (const item of items) {
        if (item.isFile()) {
          const extension = item.name.split('.').pop().toLowerCase();
          if (isNotDocument(extension)) continue
          // Phân loại file theo định dạng
          if (documentExtensions.doc.includes(extension)) {
            categorizedFiles.docFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          } else if (documentExtensions.txt.includes(extension)) {
            categorizedFiles.txtFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          } else if (documentExtensions.csvExcel.includes(extension)) {
            categorizedFiles.csvExcelFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          } else if (documentExtensions.others.includes(extension)) {
            categorizedFiles.otherFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          }
        } else if (item.isDirectory()) {
          // Nếu là thư mục, thêm vào danh sách để tiếp tục quét
          directoriesToScan.push(item.path);
        }
      }
    }

    return categorizedFiles;
  } catch (error) {
    console.error('Error while scanning files:', error);
    return categorizedFiles; // Trả về danh sách rỗng nếu có lỗi
  }
};
