import { StyleSheet } from 'react-native';
import { SIZE } from '../../utils/Constants';

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
    marginBottom: 5,
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
    marginBottom: 20, // Khoảng cách giữa các mục
  },
  thumbnail: {
    width: '100%',
    height: 200, // Chiều cao của thumbnail
    justifyContent: 'flex-end', // Đẩy thanh công cụ xuống dưới
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Nền mờ cho thanh công cụ
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
