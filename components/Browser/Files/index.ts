import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 75,
    },
    itemContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      height: '100%',
    },
    itemLeft: {
      height: '100%',
      width: '83%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemThumbnail: {
      height: '100%',
      marginLeft: 8,
      width: '17%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemDetails: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      height: '100%',
      width: '83%',
      overflow: 'hidden',
    },
    itemActionButton: {
      width: '8%',
      height: '100%',
    },
    image: {
      margin: 1,
      width: 40,
      height: 50,
      resizeMode: 'cover',
      borderRadius: 5,
    },
    fileMenu: {
      marginRight: 5,
      height: 60,
      display: 'flex',
      justifyContent: 'center',
    },
    fileName: {
      fontSize: 15,
    },
    fileDetailText: {
      fontSize: 10,
    },
  });
  