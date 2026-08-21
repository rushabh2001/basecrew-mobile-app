import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MobileUser } from '../api/types';

const TOKEN_KEY = 'basecrew.mobile.token';
const USER_KEY = 'basecrew.mobile.user';

export async function saveSession(token: string, user: MobileUser) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadSession(): Promise<{ token: string; user: MobileUser } | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const userRaw = await AsyncStorage.getItem(USER_KEY);
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) as MobileUser };
  } catch {
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}
