import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAppState } from './useAppState';
import { LOCK_TYPE } from '../constants/const';

export default function useLock() {
  const [locked, setLocked] = useState<boolean>(true);
  const [lockType, setLockType] = useState<number>(LOCK_TYPE.NONE);
  const appStateVisible = useAppState();

  const getPassCodeStatus = async () => {
    const hasPassCode = await SecureStore.getItemAsync('hasPassCode');
    const hasBioMetric = await SecureStore.getItemAsync('biometricsActive')
    const hasPassCodeValue = JSON.parse(hasPassCode)
    const hasBioMetricValue = JSON.parse(hasBioMetric)
    if (hasPassCodeValue && hasBioMetricValue) {
      setLockType(LOCK_TYPE.BOTH);
      return true;
    } else if (hasPassCodeValue) {
      setLockType(LOCK_TYPE.PIN);
      return true;
    } else if (hasBioMetricValue) {
      setLockType(LOCK_TYPE.BIOMETRIC);
      return true;
    } else {
      setLockType(LOCK_TYPE.NONE);
      return false
    }
  };

  const checkStatus = async () => {
    const pinActive = await getPassCodeStatus();
    if (!appStateVisible && pinActive) {
      setLocked(true);
    } else {
      setLocked(pinActive);
    }
  }

  useEffect(() => {
    checkStatus()
    console.log("COME", appStateVisible)
  }, [appStateVisible]);

  return { locked, setLocked, lockType, getPassCodeStatus };
}
