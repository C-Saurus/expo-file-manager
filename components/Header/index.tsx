import { Entypo, FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export const HeaderRight: React.FC<any>  = React.memo(
  ({ viewMode, index, handleChooseMode, handleChooseOption }) => (
    <View
      style={[styles.headerIconContainer, { display: index ? 'none' : 'flex' }]}
    >
      {viewMode === 0 ? (
        <TouchableOpacity onPress={handleChooseMode}>
          <FontAwesome name="th-list" size={24} color="black" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleChooseMode}>
          <FontAwesome name="th" size={24} color="black" />
        </TouchableOpacity>
      )}
      {viewMode === 1 && (
        <TouchableOpacity
          style={{ marginLeft: 12 }}
          onPress={handleChooseOption}
        >
          <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  )
);


export const styles = StyleSheet.create({
  headerIconContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginRight: 15,
  }
});


