import { StyleSheet } from 'react-native';
import { HEIGHT, SIZE } from '../../utils/Constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerNav: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZE,
    marginBottom: 15,
  },
  navbarTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButtonContainer: {
    position: 'absolute',
    right: 10,
  },
  confirmButton: {
    position: 'absolute',
    left: 10,
  },
  listContainer: {
    width: SIZE,
    height: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAccessContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    paddingHorizontal: 16
  },
  noAccessText: {
    marginBottom: 20,
    fontFamily: 'Poppins_500Medium',
  },
  handleImport: {
    display: 'flex',
    flexDirection: 'row',
    width: 60,
    height: 30,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  dateGroup: {
    marginBottom: 20,
  },
  emptyItem: {
    width: SIZE / 3,
    height: SIZE / 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10
  },
  albumList: {
    width: SIZE,
  },
  contentContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  fullScreenImageContainer: {
    width: SIZE,
    height: SIZE,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  itemContainer: {
    width: SIZE, // Chiều rộng của mỗi phần tử bằng chiều rộng màn hình
    height: HEIGHT, // Chiều cao của mỗi phần tử bằng chiều cao màn hình
  },
  thumbnail: {
    width: '100%', // Chiếm toàn bộ chiều rộng
    height: '100%', // Chiếm toàn bộ chiều cao
    justifyContent: 'flex-end', // Đưa nội dung xuống phía dưới
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ phía dưới
    padding: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40, // Căn chỉnh khoảng cách từ trên cùng màn hình
    left: 20, // Căn chỉnh khoảng cách từ bên trái màn hình
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ để nổi bật
    borderRadius: 20, // Góc bo tròn
    padding: 10,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleSheet.absoluteFillObject, // Phủ toàn bộ màn hình
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Màu nền mờ
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Đảm bảo overlay nằm trên cùng
  }
});
