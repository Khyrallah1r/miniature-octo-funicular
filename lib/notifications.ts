import { Platform } from 'react-native';

import type { ReminderTime } from '@/lib/store';

export type ReminderRequest = {
  enabled: boolean;
  morning: ReminderTime;
  evening: ReminderTime;
};

export type ReminderOutcome = {
  ok: boolean;
  reason?: 'unsupported' | 'denied' | 'error';
  message?: string;
};

const CHANNEL_ID = 'hisn-reminders';

export const remindersSupported = Platform.OS !== 'web';

type NotificationsModule = typeof import('expo-notifications');

let moduleCache: NotificationsModule | null = null;
let handlerInstalled = false;

function getNotifications(): NotificationsModule | null {
  if (!remindersSupported) return null;
  if (!moduleCache) {
    moduleCache = require('expo-notifications') as NotificationsModule;
  }
  if (!handlerInstalled) {
    moduleCache.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerInstalled = true;
  }
  return moduleCache;
}

export async function applyReminders(request: ReminderRequest): Promise<ReminderOutcome> {
  const notifications = getNotifications();
  if (!notifications) {
    return {
      ok: false,
      reason: 'unsupported',
      message: 'التذكيرات اليومية تعمل داخل نسخة الأندرويد، ولا تعمل في معاينة المتصفح.',
    };
  }

  try {
    await notifications.cancelAllScheduledNotificationsAsync();

    if (!request.enabled) return { ok: true };

    const permissions = await notifications.getPermissionsAsync();
    let granted = permissions.granted;
    if (!granted && permissions.canAskAgain) {
      const asked = await notifications.requestPermissionsAsync();
      granted = asked.granted;
    }
    if (!granted) {
      return {
        ok: false,
        reason: 'denied',
        message: 'لم يُسمح بالإشعارات. فعّلها من إعدادات الجهاز لتصل التذكيرات.',
      };
    }

    if (Platform.OS === 'android') {
      await notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'تذكيرات حصن المسلم',
        importance: notifications.AndroidImportance.DEFAULT,
        sound: 'default',
        vibrationPattern: [0, 220, 160, 220],
      });
    }

    const schedule = (time: ReminderTime, title: string, body: string) =>
      notifications.scheduleNotificationAsync({
        content: { title, body, sound: 'default' },
        trigger: {
          type: notifications.SchedulableTriggerInputTypes.DAILY,
          hour: time.hour,
          minute: time.minute,
          channelId: CHANNEL_ID,
        },
      });

    await schedule(
      request.morning,
      'أذكار الصباح',
      'ابدأ يومك بذكر الله — أذكار الصباح بانتظارك في حصن المسلم.'
    );
    await schedule(
      request.evening,
      'أذكار المساء',
      'اختم يومك بذكر الله — أذكار المساء بانتظارك في حصن المسلم.'
    );

    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: 'error',
      message: 'تعذّر جدولة التذكيرات على هذا الجهاز.',
    };
  }
}

export function formatTimeLabel(time: ReminderTime): string {
  const hour12 = time.hour % 12 === 0 ? 12 : time.hour % 12;
  const period = time.hour < 12 ? 'ص' : 'م';
  const minutes = String(time.minute).padStart(2, '0');
  return `${hour12}:${minutes} ${period}`;
}
