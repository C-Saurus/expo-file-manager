import React, { useEffect, useRef, useState } from 'react';
import {
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { Entypo } from '@expo/vector-icons';
import { fetchFiles } from '../../stores/document/action';
import { ActivityIndicator } from 'react-native-paper';
import { TabDocFiles } from '../Document/list';
import { styles } from '../Document/style';

const ZipScreen = () => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false);
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { zip, loading, error } = useAppSelector(
    (state) => state.documentFile
  );

  useEffect(() => {
    if (hasFetchFile.current) return;
    if (!zip.length && !hasFetchFile.current) {
      dispatch(fetchFiles());
      hasFetchFile.current = true;
    }
  }, [dispatch, zip]);

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
    <TabDocFiles data={zip} fileType={'zip'} />
  );
};

export default ZipScreen;
