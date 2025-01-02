import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyIcon: {
      width: 100,
      height: 100,
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 16,
      color: '#888',
    },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#ffffff',
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderColor: '#ddd',
    },
    avatar: {
      width: 40,
      height: 40,
      marginRight: 10,
    },
    infoContainer: {
      flex: 1,
    },
    fileName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    timeLeft: {
      fontSize: 14,
      color: '#888',
    },
    fileSize: {
      marginRight: 10,
      fontSize: 14,
      color: '#444',
    },
    emptyList: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    btnContainer: {
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
    image: {
      margin: 1,
      width: 40,
      height: 50,
      resizeMode: 'cover',
      borderRadius: 5,
    },
    itemThumbnail: {
      width: '18%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemDetails: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      width: '82%',
      overflow: 'hidden',
    },
  });