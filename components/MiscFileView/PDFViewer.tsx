import React from 'react';
import { StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { HEIGHT, SIZE } from '../../utils/Constants';

type IPDFViewerProps = {
  fileURI: string;
};

export const PDFViewer = ({ fileURI }: IPDFViewerProps) => {
  const source = { uri: fileURI, cache: true };
  return (
    <View style={styles.container}>
      <Pdf
        source={source}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}`);
        }}
        onError={(error) => {
          console.log(error);
        }}
        onPressLink={(uri) => {
          console.log(`Link pressed: ${uri}`);
        }}
        style={styles.pdf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: SIZE,
    height: HEIGHT,
  },
});
