import { FlatList, Image, Text, View } from "react-native";
import * as Progress from 'react-native-progress'
import { styles } from "./style";
import { DATA } from "../../constants/const";
import { MaterialIcons } from '@expo/vector-icons';

export const Home = () => {
    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
          <MaterialIcons name={item.icon} size={50} color="#6200ea" />
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.size}>{item.size}</Text>
        </View>
      );
    
      return (
        <View style={styles.container}>
          {/* Memory Usage Info */}
          <View style={styles.memoryContainer}>
            <Text style={styles.memoryText}>Lưu trữ nội bộ</Text>
            <Text style={styles.memoryUsage}>23.38 GB / 52.59 GB</Text>
            <Progress.Circle
              size={70}
              progress={0.55} // Dung lượng sử dụng 55%
              showsText={true}
              formatText={() => '55%'}
              color="#6c5ce7"
              borderWidth={0}
              thickness={8}
            />
          </View>
    
          {/* Icon List */}
          <FlatList
            data={DATA}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={3} // Mỗi hàng có 3 cột
            columnWrapperStyle={styles.row}
          />
        </View>
      );
}