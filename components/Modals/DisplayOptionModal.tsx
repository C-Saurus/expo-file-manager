import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const DisplayOptionModal = ({
  openOption,
  setOpenOption,
  handleSort,
}) => {
  return (
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
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: 10, // Điều chỉnh vị trí modal so với nút header
    right: 35,
    backgroundColor: '#fff', // Màu nền modal
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5, // Tạo bóng mờ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#c7cecfdd', // Đường kẻ giữa các mục
  },
  modalText: {
    fontSize: 16,
    color: '#000', // Màu chữ trắng
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
