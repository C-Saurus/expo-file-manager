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
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { fetchFiles } from '../../stores/document/action';
import { ActivityIndicator } from 'react-native-paper';
import { TabDocFiles } from '../Document/list';
import { styles } from '../Document/style';
import { sortApkByOption } from '../../stores/document/reducer';

const TxtScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const hasFetchFile = useRef(false);
  const [openOption, setOpenOption] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { txt, loading, error } = useAppSelector(
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
    if (!txt.length && !hasFetchFile.current) {
      dispatch(fetchFiles());
      hasFetchFile.current = true;
    }
  }, [dispatch, txt]);

  const handleSort = (value) => {
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

  return (
    <>
      <TabDocFiles data={txt} fileType={'txt'} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={openOption}
        onRequestClose={() => setOpenOption(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpenOption(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              delayPressIn={0}
              style={styles.modalItem}
              onPress={() => handleSort(1)}
            >
              <Text style={styles.modalText}>Sắp xếp theo tên</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => handleSort(2)}
            >
              <Text style={styles.modalText}>Sắp xếp theo dung lượng</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => setSelectAll(!selectAll)}
            >
              <View style={styles.checkboxContainer}>
                <Ionicons
                  name={selectAll ? 'checkbox-outline' : 'square-outline'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.modalText}>Chọn tất cả</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default TxtScreen;
