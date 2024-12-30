import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { AntDesign, Entypo, Feather, Ionicons } from '@expo/vector-icons';
import { styles } from '.';

const CustomHeader = ({
  onBackPress,
  handleSearch,
  onAddFolderPress,
  handleChooseOption,
  colors,
  headerTitle,
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
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: colors.background3 }]}
            placeholder="Search files..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)} // Kích hoạt tìm kiếm khi nhấn Enter
          />
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: colors.background },
            ]}
            onPress={() => {
              setIsSearching(false);
              setSearchQuery(''); // Reset thanh search
            }}
          >
            <Text style={[styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.headerContainer,
            { backgroundColor: colors.background },
          ]}
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
            <TouchableOpacity onPress={() => setIsSearching(true)}>
              <Ionicons name="search" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onAddFolderPress}
              style={styles.iconButton}
            >
              <Feather name="folder-plus" size={26} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChooseOption}>
              <Entypo name="dots-three-vertical" size={23} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default CustomHeader;
