import React from 'react';
import { StyleSheet, View } from 'react-native';
import PDFReader from 'rn-pdf-reader-js';
import { HEIGHT, SIZE } from '../../utils/Constants';

type IPDFViewerProps = {
  fileURI: string;
};

export const PDFViewer = ({ fileURI }: IPDFViewerProps) => {
  console.log("fileURI", fileURI)
  return (
    <PDFReader
      source={{
        uri: "file:///data/user/0/com.martymfly.expofilemanager/files/D20CNPM.pdf",
      }}
    />
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
