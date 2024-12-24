import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AntDesign, Entypo, Feather, Ionicons } from '@expo/vector-icons';

const CustomHeader = ({
  onBackPress,
  handleSearch,
  onAddFolderPress,
  handleChooseOption,
  colors,
  headerTitle,
}) => {
  return (
    <View
      style={[styles.headerContainer, { backgroundColor: colors.background }]}
    >
      {/* Nút Back */}
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tiêu đề hoặc khoảng trống */}
      <View style={styles.centerSection}>
        <Text style={[styles.title, { color: colors.primary }]}>
          {headerTitle}
        </Text>
      </View>

      {/* Biểu tượng ở bên phải */}
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onAddFolderPress} style={styles.iconButton}>
          <Feather name="folder-plus" size={30} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChooseOption}>
          <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  leftSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backButton: {
    padding: 5,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  iconButton: {
    marginLeft: 15,
  },
});

export default CustomHeader;
