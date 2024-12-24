import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  Entypo,
  FontAwesome,
  Ionicons,
} from '@expo/vector-icons';

const MediaHeader = ({
  onBackPress,
  colors,
  viewMode,
  index,
  handleChooseMode,
  handleChooseOption,
  handleSearch,
  headerTitle,
}) => {
  const capitalizeFirstLetter = (str) => {
    if (!str) return ''; // Kiểm tra chuỗi rỗng hoặc undefined
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
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
          {capitalizeFirstLetter(headerTitle)}
        </Text>
      </View>

      {/* Biểu tượng ở bên phải */}
      <View
        style={[
          styles.headerIconContainer,
          { display: index ? 'none' : 'flex' },
        ]}
      >
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
        {viewMode === 0 ? (
          <TouchableOpacity onPress={handleChooseMode}>
            <FontAwesome name="th-list" size={24} color="black" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleChooseMode}>
            <FontAwesome name="th" size={24} color="black" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={{ marginLeft: 12 }}
          onPress={handleChooseOption}
        >
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
  headerIconContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 5,
  },
  leftSection: {
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

export default MediaHeader;
