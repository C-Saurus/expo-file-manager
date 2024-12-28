import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Entypo, Ionicons } from '@expo/vector-icons';

const Header = ({
  onBackPress,
  colors,
  handleChooseOption,
  headerTitle,
  handleSearch,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const capitalizeFirstLetter = (str) => {
    if (!str) return ''; // Kiểm tra chuỗi rỗng hoặc undefined
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  return (
    <View style={{ backgroundColor: colors.background }}>
      {isSearching ? (
        // Thanh search
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search files..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch} // Kích hoạt tìm kiếm khi nhấn Enter
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsSearching(false);
              setSearchQuery(''); // Reset thanh search
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Header mặc định
        <View style={[styles.headerContainer]}>
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
          <View style={[styles.headerIconContainer]}>
            <TouchableOpacity
              style={{ paddingRight: 10 }}
              onPress={() => setIsSearching(true)}
            >
              <Ionicons name="search" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChooseOption}>
              <Entypo name="dots-three-vertical" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  searchButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButton: {
    marginLeft: 10,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default Header;
