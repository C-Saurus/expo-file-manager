import { StyleSheet } from 'react-native';
import { SIZE } from '../../utils/Constants';

export const styles = StyleSheet.create({
  // list: {
  //   padding: 5,
  // },
  // itemContainer: {
  //   flex: 1,
  //   margin: 5, // Màu nền cho video
  //   borderRadius: 5,
  // },
  // thumbnail: {
  //   width: SIZE / 3 - 15,
  //   height: SIZE / 3 - 15,
  //   resizeMode: 'cover',
  //   borderRadius: 10,
  // },
  // filename: {
  //   display: 'flex',
  //   maxWidth: SIZE / 3,
  //   color: '#fff',
  //   padding: 5,
  //   fontSize: 12,
  //   overflow: 'hidden',
  //   backgroundColor: '#000',
    
  // },
  // tabContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   borderBottomWidth: 2,
  // },
  // tab: {
  //   padding: 15,
  //   flex: 1,
  //   alignItems: 'center',
  // },
  // activeTab: {
  //   borderBottomWidth: 2,
  //   borderBottomColor: '#4D739C',
  // },
  // tabText: {
  //   fontSize: 16,
  // },
  // dateGroup: {
  //   marginBottom: 20,
  // },
  // dateTitle: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   marginBottom: 5,
  // },
  // title: {
  //   fontFamily: 'Poppins_600SemiBold',
  //   fontSize: 20,
  //   paddingHorizontal: 20,
  // },
  // navbar: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   padding: 10,
  //   marginTop: 40,
  // },
  // container: {
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // containerNav: {
  //   flex: 1,
  //   alignItems: 'flex-start',
  //   justifyContent: 'center',
  // },
  dateGroup: {
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  albumList: {
    width: SIZE,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'white',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  thumbnailContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
