import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const sendVerificationEmail = async (email) => {
  const verificationCode = uuidv4().slice(0, 6).toUpperCase(); // Tạo mã xác thực 6 ký tự
  const templateParams = {
    email: email,
    verificationCode: verificationCode,
  };

  try {
    await axios.post('https://mail-server-zeta-eight.vercel.app/send-email', templateParams)
    // Lưu mã xác thực để so sánh sau này
    return verificationCode;
  } catch (err) {
    console.log('ERROR', err);
    throw(err)
  }
};

export const sendResetPasscodeEmail = async (email) => {
    const verificationCode = uuidv4().slice(0, 6).toUpperCase(); // Tạo mã xác thực 6 ký tự
    const templateParams = {
      email: email,
      verificationCode: verificationCode,
    };
  
    try {
      await axios.post('https://mail-server-zeta-eight.vercel.app/send-reset-code', templateParams)
      // Lưu mã xác thực để so sánh sau này
      return verificationCode;
    } catch (err) {
      console.log('ERROR', err);
      throw(err)
    }
  
  };

export const saveVerificationCode = async (code) => {
  try {
    await AsyncStorage.setItem('verification_code', code);
  } catch (error) {
    console.error('Error saving verification code:', error);
  }
};

export const getSavedVerificationCode = async () => {
  try {
    return await AsyncStorage.getItem('verification_code');
  } catch (error) {
    console.error('Error retrieving verification code:', error);
    return null;
  }
};

export const setEmailVerified = async (email) => {
  try {
    await AsyncStorage.setItem("verified_email", email);
  } catch (error) {
    console.error('Error setting email verified:', error);
  }
};

export const isEmailVerified = async () => {
  try {
    const value = await AsyncStorage.getItem("verified_email");
    return value;
  } catch (error) {
    console.error('Error checking email verified:', error);
    return undefined;
  }
};
