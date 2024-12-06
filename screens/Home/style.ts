import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  memoryContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 30,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 24
  },
  memoryText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  memoryUsage: {
    fontSize: 12,
    color: '#19191a',
    marginVertical: 10,
  },
  listItemContainer: {
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 24,
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: 'white',
    borderRadius: 10
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10
  },
  toolTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 10
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listToolContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 24,
  },
  toolItemContainer: {
    display: 'flex',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 15,
    marginVertical: 2,
  },
  listItemContainerFolder: {

    marginBottom: 30,
    backgroundColor: '#999',
    padding: 16,
    borderRadius: 24,
  }
});
