import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@server_ip';
const DEFAULT_PORT = '3000';

let cachedIp: string | null = null;

const getDefaultHost = (): string => {
  const isEmulator = Platform.OS === 'android' && Platform.constants?.Brand === 'generic';
  return isEmulator ? '10.0.2.2' : 'localhost';
};

export const initConfig = async (): Promise<void> => {
  const ip = await AsyncStorage.getItem(STORAGE_KEY);
  cachedIp = ip || getDefaultHost();
};

export const getApiUrl = (): string => {
  const host = cachedIp || getDefaultHost();
  return `http://${host}:${DEFAULT_PORT}/api`;
};

export const getWsUrl = (): string => {
  const host = cachedIp || getDefaultHost();
  return `ws://${host}:${DEFAULT_PORT}/ws/stocks`;
};

export const getServerIp = (): string => {
  return cachedIp || getDefaultHost();
};

export const setServerIp = async (ip: string): Promise<void> => {
  cachedIp = ip;
  await AsyncStorage.setItem(STORAGE_KEY, ip);
};
