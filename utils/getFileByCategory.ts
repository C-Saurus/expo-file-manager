import RNFS from 'react-native-fs';

const fileExtensionCategorys = {
  doc: ['doc', 'docx'],
  pdf: ['pdf'],
  txt: ['txt'],
  csvExcel: ['csv', 'xls', 'xlsx'],
  others: ['ppt', 'pptx', 'rtf', 'odt', 'ods', 'odp'],
  app: ['apk'],
  zip: ['zip', 'rar']
};

export const getCategoryByExtension = (extension: string) => {
  for (const [category, extensions] of Object.entries(
    fileExtensionCategorys
  )) {
    if (extensions.includes(extension.toLowerCase())) {
      return category;
    }
  }
  return 'others';
};

export const getAllFiles = async () => {
  const categorizedFiles = {
    docFiles: [],
    txtFiles: [],
    csvExcelFiles: [],
    pdfFiles: [],
    zipFiles: [],
    apkFile: [],
    otherFiles: [],
  };

  const rootPath = RNFS.ExternalStorageDirectoryPath; // Thư mục gốc trên Android
  const directoriesToScan = [rootPath];

  try {
    while (directoriesToScan.length > 0) {
      const currentDir = directoriesToScan.pop();
      let items = [];
      try {
        items = await RNFS.readDir(currentDir);
      } catch (error) {
        console.warn(`Cannot read directory: ${currentDir}`, error);
        continue;
      }
      for (const item of items) {
        if (item.isFile()) {
          const extension = item.name.split('.').pop().toLowerCase();
          if (fileExtensionCategorys.doc.includes(extension)) {
            categorizedFiles.docFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          } else if (fileExtensionCategorys.txt.includes(extension)) {
            categorizedFiles.txtFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          } else if (fileExtensionCategorys.csvExcel.includes(extension)) {
            categorizedFiles.csvExcelFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          } else if (fileExtensionCategorys.others.includes(extension)) {
            categorizedFiles.otherFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          } else if (fileExtensionCategorys.pdf.includes(extension)) {
            categorizedFiles.pdfFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          } else if (fileExtensionCategorys.zip.includes(extension)) {
            categorizedFiles.zipFiles.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          } else if (fileExtensionCategorys.app.includes(extension)) {
            categorizedFiles.apkFile.push({
              name: item.name,
              path: item.path,
              size: item.size,
            });
          }
        } else if (item.isDirectory()) {
          directoriesToScan.push(item.path);
        }
      }
    }

    return categorizedFiles;
  } catch (error) {
    console.error('Error while scanning files:', error);
    return categorizedFiles;
  }
};
