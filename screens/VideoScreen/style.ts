import { StyleSheet } from "react-native";
import { SIZE } from "../../utils/Constants";

export const styles = StyleSheet.create({
    list: {
      padding: 5,
    },
    itemContainer: {
      flex: 1,
      margin: 5,
      backgroundColor: '#000', // Màu nền cho video
      borderRadius: 5,
    },
    thumbnail: {
        width: SIZE/3 * 0.8,
        height: SIZE/3 * 0.8,
        resizeMode: 'cover',
        borderRadius: 10,
        aspectRatio: 1
    },
    filename: {
      color: '#fff',
      padding: 5,
      fontSize: 12,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 2,
      },
      tab: {
        padding: 15,
        flex: 1,
        alignItems: 'center',
      },
      activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4D739C',
      },
      tabText: {
        fontSize: 16,
      },
      dateGroup: {
        marginBottom: 20,
      },
      dateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      title: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 20,
        paddingHorizontal: 20
      },
      navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginTop: 40
      },
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
  });