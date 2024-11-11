import { Constants } from "expo-barcode-scanner";
import { HEIGHT, SIZE } from "../../utils/Constants";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: SIZE,
      paddingTop: Constants.statusBarHeight,
    },
    topButtons: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 15,
      marginHorizontal: 10,
    },
    topLeft: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '25%',
    },
    topRight: {
      width: '75%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    fileList: {
      flex: 1,
      borderTopWidth: 0.5,
      marginTop: 15,
      marginHorizontal: 5,
    },
    bottomMenu: {
      height: 45,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    contentStyle: {
      width: SIZE,
      height: HEIGHT * 0.8,
      padding: 0,
      margin: 0,
    },
    overlayStyle: {
      width: SIZE,
      padding: 0,
      margin: 0,
    },
  });