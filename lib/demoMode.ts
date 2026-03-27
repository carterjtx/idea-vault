import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_MODE_KEY = 'ideavault_demo_mode';

let _isDemoMode = false;

export function isDemoMode(): boolean {
  return _isDemoMode;
}

export async function enableDemoMode(): Promise<void> {
  _isDemoMode = true;
  await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
}

export async function disableDemoMode(): Promise<void> {
  _isDemoMode = false;
  await AsyncStorage.removeItem(DEMO_MODE_KEY);
}

export async function loadDemoModeState(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(DEMO_MODE_KEY);
    _isDemoMode = value === 'true';
    return _isDemoMode;
  } catch {
    return false;
  }
}
