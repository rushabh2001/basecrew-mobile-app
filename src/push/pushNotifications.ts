import { Platform, PermissionsAndroid } from 'react-native';
import * as api from '../api/client';
import { ApiError } from '../api/client';

const CHANNEL_ID = 'basecrew_alerts';
const BRAND_BLUE = '#1E63FF';

type MessagingExports = {
  getMessaging: () => any;
  setBackgroundMessageHandler: (messaging: any, handler: (msg: any) => Promise<void>) => void;
  onMessage: (messaging: any, handler: (msg: any) => void | Promise<void>) => () => void;
  onTokenRefresh: (messaging: any, handler: (token: string) => void | Promise<void>) => () => void;
  requestPermission: (messaging: any) => Promise<number>;
  getToken: (messaging: any) => Promise<string>;
  registerDeviceForRemoteMessages?: (messaging: any) => Promise<void>;
  isDeviceRegisteredForRemoteMessages?: (messaging: any) => boolean;
  AuthorizationStatus: { AUTHORIZED: number; PROVISIONAL: number; DENIED: number };
};

export type PushRegisterResult =
  | { ok: true; fcmToken: string }
  | {
      ok: false;
      reason: 'unavailable' | 'denied' | 'no_token' | 'register_failed' | 'api_missing';
      message?: string;
    };

function loadMessaging(): MessagingExports | null {
  try {
    // Modular API (RN Firebase v22+ / v26). Namespaced messaging().setBackgroundMessageHandler is gone.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@react-native-firebase/messaging');
    if (typeof mod.getMessaging !== 'function' || typeof mod.setBackgroundMessageHandler !== 'function') {
      return null;
    }
    return mod as MessagingExports;
  } catch {
    return null;
  }
}

function notifeeApi() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@notifee/react-native');
    return {
      client: mod.default ?? mod,
      AndroidStyle: mod.AndroidStyle,
      AndroidImportance: mod.AndroidImportance,
    };
  } catch {
    return null;
  }
}

export function isPushSdkAvailable() {
  return loadMessaging() != null;
}

async function ensureAndroidPermission() {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/** High-importance channel so Android shows heads-up / lock-screen banners. */
export async function ensureAlertChannel() {
  const n = notifeeApi();
  if (!n || Platform.OS !== 'android') return;
  const importance = n.AndroidImportance?.HIGH ?? 4;
  await n.client.createChannel({
    id: CHANNEL_ID,
    name: 'BaseCrew alerts',
    importance,
    sound: 'default',
    vibration: true,
    lights: true,
    lightColor: BRAND_BLUE,
  });
}

/** Display a rich local notification (foreground + Android data messages). */
export async function displayRichNotification(remoteMessage: any) {
  const n = notifeeApi();
  if (!n) return;

  await ensureAlertChannel();

  const title =
    remoteMessage?.notification?.title ||
    remoteMessage?.data?.title ||
    'BaseCrew';
  const body =
    remoteMessage?.notification?.body ||
    remoteMessage?.data?.body ||
    '';
  const subtitle =
    remoteMessage?.data?.subtitle ||
    (remoteMessage?.data?.kind === 'announcement' ? 'Announcement' : undefined);
  const imageUrl =
    remoteMessage?.notification?.android?.imageUrl ||
    remoteMessage?.data?.imageUrl ||
    remoteMessage?.notification?.imageUrl;

  const importance = n.AndroidImportance?.HIGH ?? 4;
  const bigPicture = n.AndroidStyle?.BIGPICTURE;

  await n.client.displayNotification({
    title,
    body,
    subtitle,
    data: remoteMessage?.data ?? {},
    android: {
      channelId: CHANNEL_ID,
      color: BRAND_BLUE,
      pressAction: { id: 'default' },
      smallIcon: 'ic_launcher',
      importance,
      ...(imageUrl && bigPicture != null
        ? {
            largeIcon: imageUrl,
            style: { type: bigPicture, picture: imageUrl },
          }
        : {}),
    },
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
      ...(imageUrl ? { attachments: [{ url: imageUrl }] } : {}),
    },
  });
}

async function ensureIosRemoteRegistration(mod: MessagingExports, messaging: any) {
  if (Platform.OS !== 'ios' || typeof mod.registerDeviceForRemoteMessages !== 'function') {
    return;
  }
  const already =
    typeof mod.isDeviceRegisteredForRemoteMessages === 'function'
      ? mod.isDeviceRegisteredForRemoteMessages(messaging)
      : false;
  if (already) return;
  await mod.registerDeviceForRemoteMessages(messaging);
}

/**
 * Request OS permission, fetch FCM token, register with BaseCrew API.
 */
export async function enableAndRegisterPush(
  token: string | null | undefined,
): Promise<PushRegisterResult> {
  const mod = loadMessaging();
  if (!mod || !token) return { ok: false, reason: 'unavailable' };

  try {
    const androidOk = await ensureAndroidPermission();
    if (!androidOk) return { ok: false, reason: 'denied' };

    const messaging = mod.getMessaging();
    const authStatus = await mod.requestPermission(messaging);
    const allowed =
      authStatus === mod.AuthorizationStatus.AUTHORIZED ||
      authStatus === mod.AuthorizationStatus.PROVISIONAL;
    if (!allowed) return { ok: false, reason: 'denied' };

    await ensureAlertChannel();
    await ensureIosRemoteRegistration(mod, messaging);

    const fcmToken = await mod.getToken(messaging);
    if (!fcmToken) return { ok: false, reason: 'no_token' };

    await api.registerPushDevice(token, {
      token: fcmToken,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });

    return { ok: true, fcmToken };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not register for push';
    if (e instanceof ApiError && e.status === 404) {
      return { ok: false, reason: 'api_missing', message };
    }
    console.warn('[push] enableAndRegisterPush failed', e);
    return { ok: false, reason: 'register_failed', message };
  }
}

export async function unregisterPush(token: string | null | undefined, fcmToken?: string | null) {
  if (!token) return;
  try {
    await api.unregisterPushDevice(token, fcmToken ?? undefined);
  } catch {
    // ignore
  }
}

export function startPushTokenSync(authToken: string | null | undefined) {
  const mod = loadMessaging();
  if (!mod || !authToken) return () => {};

  const messaging = mod.getMessaging();

  const unsubRefresh = mod.onTokenRefresh(messaging, async next => {
    try {
      await api.registerPushDevice(authToken, {
        token: next,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
      });
    } catch {
      // ignore
    }
  });

  const unsubForeground = mod.onMessage(messaging, async remoteMessage => {
    try {
      await displayRichNotification(remoteMessage);
    } catch (e) {
      console.warn('[push] foreground display failed', e);
    }
  });

  return () => {
    unsubRefresh();
    unsubForeground();
  };
}

/**
 * Call once from index.js (outside React).
 * Uses modular setBackgroundMessageHandler(messaging, handler) - required on RN Firebase v26.
 */
export function registerBackgroundHandler() {
  const mod = loadMessaging();
  if (!mod) return;

  try {
    const messaging = mod.getMessaging();
    mod.setBackgroundMessageHandler(messaging, async remoteMessage => {
      try {
        // iOS usually displays notification payloads via APNs; this mainly covers data messages / Android.
        if (Platform.OS === 'android' || remoteMessage?.notification == null) {
          await displayRichNotification(remoteMessage);
        }
      } catch {
        // OS may already show the notification
      }
    });
  } catch (e) {
    console.warn('[push] setBackgroundMessageHandler failed', e);
  }
}
