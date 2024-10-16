import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f5f8',
  },
  memoryContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  memoryText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  memoryUsage: {
    fontSize: 14,
    color: '#999',
    marginVertical: 10,
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  size: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
});
