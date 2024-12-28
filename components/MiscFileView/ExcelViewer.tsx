import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../hooks/reduxHooks';
import { ActivityIndicator, View } from 'react-native';

const ExcelViewer = ({ filePath }) => { 
    const { colors } = useAppSelector((state) => state.theme.theme);
  // const [isOnline, setIsOnline] = useState(true);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    setLoading(true);
    readCSVFile(filePath)
    
  }, [filePath]);

  const readCSVFile = (filePath: string) => {
    RNFS.readFile(filePath, 'utf8')
      .then((content) => {
        const rows = content.split('\n');
        const htmlContent = `
          <table border="1">
            ${rows.map(row => {
              const cells = row.split(',');
              return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
            }).join('')}
          </table>
        `;
        setHtmlContent(htmlContent);
      })
      .catch((error) => {
        console.error('Error reading CSV file:', error);
      })
      .finally(() => setLoading(false));
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
}

export default ExcelViewer;
