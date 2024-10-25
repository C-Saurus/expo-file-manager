import { FlatList, Image, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { styles } from './style';
import { DATA } from '../../constants/const';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';

export const Home = () => {
  const DATATOOL = [
    {
      id: '1',
      title: 'Tệp lớn',
      icon: 'insert-drive-file',
      iconLib: 'MaterialIcons',
      color: '#bbdefb',
    },
    {
      id: '2',
      title: 'Filter Duplicate',
      icon: 'filter',
      iconLib: 'MaterialIcons',
      color: '#b3e5fc',
    },
    {
      id: '3',
      title: 'Trash',
      icon: 'trash',
      iconLib: 'FontAwesome5',
      color: '#ffcdd2',
    }
  ];

  const renderIcon = (item) => {
    switch (item.iconLib) {
      case 'MaterialIcons':
        return <MaterialIcons name={item.icon} size={40} color="#6200ea" />;
      case 'FontAwesome5':
        return <FontAwesome5 name={item.icon} size={40} color="#6200ea" />;
      case 'Ionicons':
        return <Ionicons name={item.icon} size={40} color="#6200ea" />;
      default:
        return null;
    }
  };
  const renderToolItem = ({ item }) => (
    <View style={[styles.toolItemContainer, { backgroundColor: item.color }]}>
      {renderIcon(item)}
      <Text style={styles.title}>{item.title}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <MaterialIcons name={item.icon} size={30} color="#6200ea" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.size}>{item.size}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Memory Usage Info */}
      <View style={styles.memoryContainer}>
        <View>
          <Text style={styles.memoryText}>Lưu trữ nội bộ</Text>
          <Text style={styles.memoryUsage}>23.38 GB / 52.59 GB</Text>
        </View>
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
      <View style={styles.listItemContainer}>
        <FlatList
          data={DATA}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={4} // Mỗi hàng có 3 cột
          columnWrapperStyle={styles.row}
        />
      </View>

      <View style={styles.listToolContainer}>
        <Text style={styles.header}>Công cụ</Text>
        <FlatList
          data={DATATOOL}
          renderItem={renderToolItem}
          keyExtractor={(item) => item.id}
          numColumns={1}
        />
      </View>
    </View>
  );
};
