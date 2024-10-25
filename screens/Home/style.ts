import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f5f8',
  },
  memoryContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 30,
    backgroundColor: '#999',
    padding: 16,
    borderRadius: 24
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
  listItemContainer: {
    marginHorizontal: 8,
    marginVertical: 30,
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
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listToolContainer: {
    backgroundColor: '#999',
    padding: 16,
    borderRadius: 24,
  },
  toolItemContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginVertical: 4
  },
});
