import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Constants from 'expo-constants';

import { useAppSelector } from '../hooks/reduxHooks';
import { StackScreenProps } from '@react-navigation/stack';
import { PDFViewer } from '../components/MiscFileView/PDFViewer';
import DocViewer from '../components/MiscFileView/DocViewer';
import TxtViewer from '../components/MiscFileView/TxtViewer';
import ExcelViewer from '../components/MiscFileView/ExcelViewer';

type MiscFileViewParamList = {
  MiscFileView: { prevDir: string; folderName: string };
};

type Props = StackScreenProps<MiscFileViewParamList, 'MiscFileView'>;

const MiscFileView = ({ route }: Props) => {
  console.log("MiscFileViewwwwwwwwwwwwwwwwwwwwwwwww")
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { prevDir, folderName } = route.params;
  const fileExt = folderName.split('/').pop().split('.').pop().toLowerCase();

  if (fileExt === 'pdf')
    return <PDFViewer fileURI={'file://' + folderName} />;

  else if (['doc', "docx"].includes(fileExt)) {
    console.log("come", folderName)
    return <DocViewer filePath={folderName} />
  } else if (fileExt === 'txt') {
    return <TxtViewer filePath={folderName} />
  } else if (['csv', "xlsx"].includes(fileExt)) {
    return <ExcelViewer filePath={folderName} />
  }

  return (
    <View style={{ ...styles.container, backgroundColor: colors.background }}>
      <Text style={{ color: colors.primary }}>
        This file format is not supported.
      </Text>
    </View>
  );
};

export default MiscFileView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
