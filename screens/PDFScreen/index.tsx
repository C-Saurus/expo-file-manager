import React, { useEffect, useRef } from 'react';
import {
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchFiles } from '../../stores/document/action';
import { ActivityIndicator } from 'react-native-paper';
import { TabDocFiles } from '../Document/list';
import { styles } from '../Document/style';

const PDFScreen = () => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false);
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { pdf, loading, error } = useAppSelector(
    (state) => state.documentFile
  );
  useEffect(() => {
    if (hasFetchFile.current) return;
    if (!pdf.length && !hasFetchFile.current) {
      dispatch(fetchFiles());
      hasFetchFile.current = true;
    }
  }, [dispatch, pdf]);

  if (loading) {
    return (
      <View
        style={{
          ...styles.container,
          backgroundColor: colors.background2,
          width: '100%',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <TabDocFiles data={pdf} fileType={'pdf'} />
  );
};

export default PDFScreen;
