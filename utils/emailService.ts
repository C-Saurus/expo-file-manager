import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const sendVerificationEmail = async (email) => {
  const templateParams = {
    email: email,
  };

  try {
    const res = await axios.post(
      'https://mail-server-zeta-eight.vercel.app/send-email',
      templateParams
    );
    return res.data.verificationCode;
  } catch (err) {
    console.log('ERROR', err);
    throw err;
  }
};

export const sendResetPasscodeEmail = async () => {
  const email = await isEmailVerified()
  console.log("email", email)
  const templateParams = {
    email: email,
  };

  try {
    const res = await axios.post(
      'https://mail-server-zeta-eight.vercel.app/send-reset-code',
      templateParams
    );
    return res.data.resetCode;
  } catch (err) {
    console.log('ERROR', err);
    throw err;
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
    await AsyncStorage.setItem('verified_email', email);
  } catch (error) {
    console.error('Error setting email verified:', error);
  }
};

export const isEmailVerified = async () => {
  try {
    const value = await AsyncStorage.getItem('verified_email');
    return value;
  } catch (error) {
    console.error('Error checking email verified:', error);
    return undefined;
  }
};
