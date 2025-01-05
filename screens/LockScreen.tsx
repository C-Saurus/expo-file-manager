import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { FontAwesome5, Ionicons } from '@expo/vector-icons';

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

import useBiometrics from '../hooks/useBiometrics';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';

import { SIZE } from '../utils/Constants';
import { setSnack } from '../features/files/snackbarSlice';
import { LOCK_TYPE } from '../constants/const';
import { sendResetPasscodeEmail } from '../utils/emailService';
import Toast from 'react-native-toast-message';

const DIGIT_SIZE = SIZE / 6;

type ILockScreenProps = {
  lockType?: number;
  setLocked: (value: boolean) => void;
};

const LockScreen = ({ lockType, setLocked }: ILockScreenProps) => {
  const dispatch = useAppDispatch();
  const { colors } = useAppSelector((state) => state.theme.theme);
  const { biometricsActive } = useBiometrics();
  const [secret, setSecret] = useState('');
  const [checkPin, setCheckPin] = useState('');
  const [dotsArray, setDotsArray] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  const getSecret = async () => {
    SecureStore.getItemAsync('secret').then((res) => setSecret(res));
  };

  const authWithBiometrics = () => {
    LocalAuthentication.authenticateAsync().then((result) => {
      if (result.success) {
        setLocked(false);
      }
    });
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) getSecret();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (checkPin.length === 4) {
      if (secret === checkPin) {
        setTimeout(() => {
          setLocked(false);
        }, 10);
      } else {
        dispatch(setSnack({ message: 'Wrong PIN!' }));
        setCheckPin('');
      }
    }
  }, [checkPin]);

  const DigitItem = ({ digit }: { digit: number }) => {
    return (
      <TouchableOpacity
        key={digit}
        style={styles.digitItem}
        onPress={() => onDigitPress(digit)}
      >
        <Text style={[styles.digitNumber, { color: colors.primary }]}>
          {digit}
        </Text>
      </TouchableOpacity>
    );
  };

  const DigitsRow = ({ digits }: { digits: number[] }) => {
    return (
      <View style={styles.digitRow}>
        {digits.map((digit) => (
          <DigitItem key={digit} digit={digit} />
        ))}
      </View>
    );
  };

  const handleRemove = () => {
    if (checkPin.length > 0) {
      setCheckPin((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const onDigitPress = (digit: number) => {
    if (checkPin.length < 4) {
      setCheckPin((prev) => prev + digit);
    }
  };

  const handleCloseModal = () => {
    console.log('COME');
    setModalConfirmVisible(false);
    setError('');
    setCode('');
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    const isValid = code === verificationCode;
    if (isValid) {
      SecureStore.deleteItemAsync("hasPassCode")
      setLocked(false)
    } else {
      setError('Wrong code!');
    }
    setLoading(false);
  };

  const handleForgotPIN = async () => {
    setLoading(true)
    try {
      const res = await sendResetPasscodeEmail()
      setVerificationCode(res)
      setModalConfirmVisible(true)
    } catch (error) {
      console.error("sendResetPasscodeEmail", error)
      Toast.show({
        text1: "Network error! Please check your connection",
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
    
  };

  const PinDot = ({ filled, index }: { filled: boolean; index: number }) => {
    return (
      <View
        key={`${index}-dot`}
        style={[
          styles.pinDot,
          { backgroundColor: filled ? '#0089CD' : colors.primary },
        ]}
      ></View>
    );
  };

  const PinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {dotsArray.map((dot, index) => (
          <PinDot key={`${index}-D`} filled={dot} index={index} />
        ))}
      </View>
    );
  };

  useEffect(() => {
    let dotsRef = checkPin;
    switch (dotsRef.length) {
      case 0:
        setDotsArray((_) => [false, false, false, false]);
        break;
      case 1:
        setDotsArray((_) => [true, false, false, false]);
        break;
      case 2:
        setDotsArray((_) => [true, true, false, false]);
        break;
      case 3:
        setDotsArray((_) => [true, true, true, false]);
        break;
      case 4:
        setDotsArray((_) => [true, true, true, true]);
        break;
      default:
        break;
    }
  }, [checkPin]);

  if (lockType === LOCK_TYPE.BIOMETRIC) {
    return (
      <View style={[styles.containerBiometric, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.fingerprintButton}
          onPress={() => {
            if (biometricsActive) {
              authWithBiometrics();
            }
          }}
        >
          <FontAwesome5 name="fingerprint" size={50} color="#007AFF" />
        </TouchableOpacity>

        <Text style={styles.text}>Press finger icon to enter biometrics</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[styles.setupContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.title, { color: colors.primary, fontSize: 18 }]}>
          Enter Your PIN
        </Text>
        <View style={{ width: '100%', height: 50, marginTop: 20 }}>
          <PinDots />
        </View>
        <View style={[styles.digitsContainer]}>
          <DigitsRow digits={[1, 2, 3]} />
          <DigitsRow digits={[4, 5, 6]} />
          <DigitsRow digits={[7, 8, 9]} />
          <View style={styles.digitRow}>
            {lockType === LOCK_TYPE.BOTH ? (
              <TouchableOpacity
                style={styles.digitItem}
                onPress={() => {
                  if (biometricsActive) {
                    authWithBiometrics();
                  }
                }}
              >
                <FontAwesome5
                  name="fingerprint"
                  size={DIGIT_SIZE * 0.5}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.digitItem}></View>
            )}
            <TouchableOpacity
              key={0}
              style={styles.digitItem}
              onPress={() => onDigitPress(0)}
            >
              <Text style={[styles.digitNumber, { color: colors.primary }]}>
                0
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              key={'remove'}
              style={styles.digitItem}
              onPress={handleRemove}
            >
              <Text style={[styles.digitNumber, { color: colors.primary }]}>
                {'<'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ paddingTop: 10 }}
            onPress={handleForgotPIN}
          >
            <Text style={{ color: colors.secondary }}>Forgot PIN ?</Text>
          </TouchableOpacity>
        </View>
      </View>
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
      {loading && !modalConfirmVisible && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
};

export default React.memo(LockScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 20,
  },
  containerBiometric: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
  },
  setupContainer: {
    width: SIZE,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitsContainer: {
    width: '100%',
    height: '70%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  digitRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  digitItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: DIGIT_SIZE,
    height: DIGIT_SIZE,
  },
  digitNumber: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: DIGIT_SIZE * 0.5,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 15,
  },
  pinDotsContainer: {
    width: SIZE,
    height: 25,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    borderRadius: 100,
    width: 100,
    height: 100,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});
