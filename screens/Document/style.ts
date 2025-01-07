import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 10,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalContainer: {
    position: 'absolute',
    top: 10,
    right: 35,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#c7cecfdd',
  },
  modalText: {
    fontSize: 16,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  fileItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, marginRight: 10 },
  fileName: { flex: 1 },
  fileInfo: { flexDirection: 'row', alignItems: 'center' },
  fileSize: { marginRight: 10 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
  },
  nav: {
    flex: 1,
    position: 'absolute',
    right: 0,
    left: 0,
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
