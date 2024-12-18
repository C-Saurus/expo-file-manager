import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { fetchFiles } from '../../stores/document/action';
import { ActivityIndicator } from 'react-native-paper';
import { TabDocFiles } from '../Document/list';
import { styles } from '../Document/style';
import { sortPdfByOption } from '../../stores/document/reducer';
import { DisplayOptionModal } from '../../components/Modals/DisplayOptionModal';

const PDFScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false);
  const [openOption, setOpenOption] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { pdfFiles, loading, error } = useAppSelector(
    (state) => state.documentFile
  );
  const layout = useWindowDimensions();

  const handleChooseOption = () => {
    setOpenOption(!openOption);
  };

  useEffect(() => {
    // Cập nhật headerRight khi màn hình này được render
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleChooseOption}>
          <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: {
        marginRight: 15,
      },
    });
  }, [navigation, openOption]);

  useEffect(() => {
    if (hasFetchFile.current) return;
    if (!pdfFiles.length && !hasFetchFile.current) {
      dispatch(fetchFiles());
      hasFetchFile.current = true;
    }
  }, [dispatch, pdfFiles]);

  const handleSort = (value) => {
    dispatch(sortPdfByOption(value))
    setOpenOption(false);
  };

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

  console.log("RE_RENDER_PDF");
  return (
    <>
      <TabDocFiles data={pdfFiles} selectAll={selectAll} />
      <DisplayOptionModal
        openOption={openOption}
        setOpenOption={setOpenOption}
        handleSort={handleSort}
      />
    </>
  );
};

export default PDFScreen;
