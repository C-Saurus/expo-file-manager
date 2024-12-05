import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    textContainer: {
        flex: 1,
        padding: 16,
        marginBottom: 16,
        marginTop: 16,
    },
    label: {
        fontSize: 14,
        color: '#888'
    },
    icon: {
        width: 20,
        height: 20,
        marginHorizontal: 8
    },
    previewImage: {
        width: 220,
        height: 220,
        marginBottom: 16,
        borderColor: '#ccc',
        borderWidth: 2,
        borderRadius: 5
    },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        paddingEnd: 8
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
        elevation: 2,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});