import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import type { ClockGeoPayload } from '../api/types';

async function ensureAndroidPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location for clock in/out',
      message:
        'BaseCrew needs your location when you clock in or out so attendance can be verified.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );
  return fine === PermissionsAndroid.RESULTS.GRANTED;
}

export async function getClockGeo(): Promise<ClockGeoPayload> {
  const allowed = await ensureAndroidPermission();
  if (!allowed) {
    throw new Error('Location permission is required for geo clock in/out');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy ?? null,
          source: 'mobile',
        });
      },
      error => reject(new Error(error.message || 'Unable to read location')),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      },
    );
  });
}
