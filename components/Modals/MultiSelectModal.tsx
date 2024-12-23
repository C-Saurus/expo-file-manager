import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MultiSelect: React.FC<any> = React.memo(({
    multiSelect,
    colors,
    displaySelectedSize,
    selectAll,
    cancelMultiSelect,
    handleMoveFile,
    handleCopyFile,
    handleDeleteFile,
    toggleSelectAll,
  }) => {

    return (
      <View style={[styles.nav, {display: multiSelect ? 'flex' : 'none'}]}>
        <View style={styles.navFirst}>
          <Text style={styles.count}>{displaySelectedSize}</Text>
          <Text style={styles.count}>Multiple Select</Text>
          <TouchableOpacity onPress={cancelMultiSelect}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.line}></View>
        <View style={styles.navFirst}>
          <TouchableOpacity onPress={handleMoveFile}>
            <MaterialCommunityIcons
              name="file-move-outline"
              size={24}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCopyFile}>
            <Ionicons name="copy-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteFile}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={24}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleSelectAll}>
            <Feather
              style={{ marginLeft: 10 }}
              name={selectAll ? 'check-square' : 'square'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  })

const styles = StyleSheet.create({
  nav: {
    flex: 1,
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'space-between',
    backgroundColor: '#4cabebfd',
  },
  navFirst: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  count: {
    fontSize: 16,
  },
  line: {
    height: 1,
    backgroundColor: '#1f3442fd',
  },
});
