import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import {
  getSavedVerificationCode,
  isEmailVerified,
  saveVerificationCode,
  sendVerificationEmail,
  setEmailVerified,
} from '../../utils/emailService';
import { Modal } from 'react-native';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import useLock from '../../hooks/useLock';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { setDarkTheme, setLightTheme } from '../../features/files/themeSlice';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useBiometrics from '../../hooks/useBiometrics';
import { setSnack } from '../../features/files/snackbarSlice';

function Settings() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { theme } = useAppSelector((state) => state.theme);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState(null);
  const [error, setError] = useState('');
  const { pinActive } = useLock();
  const [loading, setLoading] = useState(false);
  const { biometricsActive, hasHardware, isEnrolled, handleBiometricsStatus } =
    useBiometrics();
  const dispatch = useAppDispatch();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCheckEmail = async () => {
    setLoading(true);
    const email = await isEmailVerified();
    if (email) {
      setEmailVerified(email);
      navigation.navigate('SetPassCodeScreen');
    } else {
      setModalVisible(true);
    }
    setLoading(false);
  };

  const verifyEmail = async (inputCode) => {
    if (inputCode === verificationCode) {
      Alert.alert('Thành công', 'Email của bạn đã được xác thực!');
      // Thực hiện bước tiếp theo, như lưu trạng thái xác thực
      return true;
    } else {
      Alert.alert('Lỗi', 'Mã xác thực không hợp lệ.');
      return false;
    }
  };

  const handleSendVerification = async () => {
    if (!email.trim()) {
      setError('Email is required!');
      return;
    } else if (!validateEmail(email.trim())) {
      setError('Invalid email format!');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const code = await sendVerificationEmail(email);
      setVerificationCode(code);
      setModalConfirmVisible(true);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi mã xác thực. Vui lòng thử lại.');
    } finally {
      setError('');
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    const isValid = await verifyEmail(code);
    if (isValid) {
      setEmailVerified(email);
      navigation.navigate('SetPassCodeScreen');
    } else {
      setError('Wrong code!');
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    console.log('COME');
    setModalConfirmVisible(false);
    setModalVisible(false);
    setError('');
    setEmail('');
    setCode('');
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Preferences Section */}
      <View style={[styles.card, { backgroundColor: theme.colors.background2 }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          THEME
        </Text>
        <Pressable
          style={[
            styles.sectionItem,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.iconWrapper}>
            <Feather
              name={theme.dark ? 'moon' : 'sun'}
              size={24}
            />
          </View>
          <Text
            style={[styles.sectionItemText, { color: theme.colors.primary }]}
          >
            Dark Mode
          </Text>
          <Switch
            value={theme.dark}
            trackColor={{
              false: theme.colors.switchFalse,
              true: 'tomato',
            }}
            thumbColor={theme.colors.switchThumb}
            onChange={async () => {
              if (theme.dark) {
                dispatch(setLightTheme());
                await AsyncStorage.setItem('colorScheme', 'light');
              } else {
                dispatch(setDarkTheme());
                await AsyncStorage.setItem('colorScheme', 'dark');
              }
            }}
          />
        </Pressable>
      </View>

      {/* Security Section */}
      <View style={[styles.card, { backgroundColor: theme.colors.background2 }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          SECURITY
        </Text>
        <Pressable
          style={[
            styles.sectionItem,
            { backgroundColor: theme.colors.background },
          ]}
          onPress={handleCheckEmail}
        >
          <View style={styles.iconWrapper}>
            <Feather
              name={pinActive ? 'lock' : 'unlock'}
              size={24}
            />
          </View>
          <Text
            style={[styles.sectionItemText, { color: theme.colors.primary }]}
          >
            PIN Code
          </Text>
          <Feather
            name="chevron-right"
            size={24}
            color={theme.colors.primary}
          />
        </Pressable>
        <Pressable
          style={[
            styles.sectionItem,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.iconWrapper}>
            <FontAwesome5
              name="fingerprint"
              size={24}
            />
          </View>
          <Text
            style={[styles.sectionItemText, { color: theme.colors.primary }]}
          >
            Unlock with Biometrics
          </Text>
          <Switch
            value={biometricsActive}
            disabled={!hasHardware}
            trackColor={{
              false: theme.colors.switchFalse,
              true: 'tomato',
            }}
            thumbColor={theme.colors.switchThumb}
            onChange={() => {
              if (hasHardware && isEnrolled) {
                handleBiometricsStatus();
              } else if (hasHardware && !isEnrolled) {
                dispatch(setSnack({ message: 'No biometrics enrolled!' }));
              }
            }}
          />
        </Pressable>
      </View>
      {loading && !modalConfirmVisible && !modalVisible && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Email to Recovery</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeIcon}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={[styles.input, error ? { borderColor: 'red' } : {}]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                placeholder="example@example.com"
                keyboardType="email-address"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity
                disabled={loading}
                style={styles.button}
                onPress={handleSendVerification}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Loading...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalConfirmVisible}
        onRequestClose={handleCloseModal}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter your recieved code</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.closeIcon}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <Text style={styles.label}>Verification Code:</Text>
              <TextInput
                style={[styles.input, error ? { borderColor: 'red' } : {}]}
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  setError('');
                }}
                placeholder="Enter 6 digit"
                keyboardType="numbers-and-punctuation"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity
                disabled={loading}
                style={styles.button}
                onPress={handleVerifyCode}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Loading...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 20,
    paddingHorizontal: 15,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5, // For Android shadow
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    marginBottom: 10,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionItemText: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    marginHorizontal: 10,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeIcon: {
    position: 'absolute',
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'tomato',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  openButton: {
    backgroundColor: '#28A745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
