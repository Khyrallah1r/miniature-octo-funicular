import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Divider, StarPattern } from '@/components/ornaments';
import { Body, Card, Header, PrimaryButton, Screen } from '@/components/ui';
import { FONT_LABELS, FONT_STEPS, useStore, type ReminderTime } from '@/lib/store';
import { applyReminders, formatTimeLabel, remindersSupported } from '@/lib/notifications';
import { radius } from '@/constants/theme';
import { useTheme } from '@/lib/use-theme';

const MORING_STEPS: ReminderTime[] = [
  { hour: 5, minute: 30 },
  { hour: 6, minute: 0 },
  { hour: 6, minute: 30 },
  { hour: 7, minute: 0 },
  { hour: 7, minute: 30 },
  { hour: 8, minute: 0 },
];

const EVENING_STEPS: ReminderTime[] = [
  { hour: 16, minute: 30 },
  { hour: 17, minute: 0 },
  { hour: 17, minute: 30 },
  { hour: 18, minute: 0 },
  { hour: 18, minute: 30 },
  { hour: 19, minute: 0 },
];

function nextStep(steps: ReminderTime[], current: ReminderTime): ReminderTime {
  const index = steps.findIndex((s) => s.hour === current.hour && s.minute === current.minute);
  return steps[(index + 1) % steps.length] ?? current;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, fonts, mode, fontScale } = useTheme();
  const { preferences, setPreferences } = useStore();
  const [notice, setNotice] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);

  const onToggleReminders = async (enabled: boolean) => {
    const next = { ...preferences, remindersEnabled: enabled };
    setPreferences({ remindersEnabled: enabled });
    const outcome = await applyReminders({
      enabled,
      morning: next.morning,
      evening: next.evening,
    });
    if (!outcome.ok) {
      if (enabled) setPreferences({ remindersEnabled: false });
      setNotice({ tone: 'warn', text: outcome.message ?? 'تعذّر تفعيل التذكيرات.' });
      return;
    }
    setNotice({
      tone: 'ok',
      text: enabled
        ? `تم تفعيل التذكير اليومي: ${formatTimeLabel(next.morning)} و${formatTimeLabel(next.evening)}`
        : 'تم إيقاف التذكيرات اليومية.',
    });
  };

  const updateTime = async (key: 'morning' | 'evening') => {
    const steps = key === 'morning' ? MORING_STEPS : EVENING_STEPS;
    const value = nextStep(steps, preferences[key]);
    const next = { ...preferences, [key]: value };
    setPreferences({ [key]: value } as Partial<typeof preferences>);
    if (preferences.remindersEnabled) {
      await applyReminders({ enabled: true, morning: next.morning, evening: next.evening });
      setNotice({ tone: 'ok', text: `تم تحديث وقت التذكير إلى ${formatTimeLabel(value)}` });
    }
  };

  return (
    <Screen scroll edges={['top']}>
      <Header title="الإعدادات" subtitle="المظهر والقراءة والتذكيرات" onBack={() => router.back()} />

      <View style={{ paddingHorizontal: 16, gap: 14 }}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={{ padding: 16, gap: 4 }}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
              <Ionicons name="color-palette-outline" size={18} color={colors.gold} />
              <Body size={16} bold>
                المظهر
              </Body>
            </View>
            <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 10 }}>
              {(
                [
                  { key: 'light', label: 'نهاري', icon: 'sunny-outline' },
                  { key: 'dark', label: 'ليلي', icon: 'moon-outline' },
                  { key: 'system', label: 'تلقائي', icon: 'phone-portrait-outline' },
                ] as const
              ).map((option) => {
                const active = preferences.themeMode === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setPreferences({ themeMode: option.key })}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      gap: 5,
                      paddingVertical: 11,
                      borderRadius: radius.md,
                      backgroundColor: active ? colors.primary : colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: active ? colors.primary : colors.border,
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={17}
                      color={active ? colors.onPrimary : colors.muted}
                    />
                    <Text
                      style={{
                        fontFamily: fonts.bodyBold,
                        fontSize: 13,
                        color: active ? colors.onPrimary : colors.muted,
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />

          <View style={{ padding: 16, gap: 12 }}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
              <Ionicons name="text-outline" size={18} color={colors.gold} />
              <Body size={16} bold style={{ flex: 1 }}>
                حجم خط الأذكار
              </Body>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gold }}>
                {`${Math.round(fontScale * 100)}٪`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
              {FONT_LABELS.map((label, index) => {
                const active = preferences.fontStep === index;
                return (
                  <Pressable
                    key={label}
                    onPress={() => setPreferences({ fontStep: index })}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 10,
                      borderRadius: radius.sm,
                      backgroundColor: active ? colors.surfaceAlt : 'transparent',
                      borderWidth: 1,
                      borderColor: active ? colors.gold : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 12 + index * 1.5,
                        color: active ? colors.text : colors.muted,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View
              style={{
                borderRadius: radius.sm,
                backgroundColor: colors.surfaceAlt,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: Math.round(17 * FONT_STEPS[preferences.fontStep]),
                  lineHeight: Math.round(17 * FONT_STEPS[preferences.fontStep] * 1.9),
                  color: colors.text,
                  textAlign: 'center',
                  writingDirection: 'rtl',
                }}
              >
                سُبْحَانَ اللهِ وَبِحَمْدِهِ، سُبْحَانَ اللهِ الْعَظِيمِ
              </Text>
            </View>
          </View>
        </Card>

        <Card style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
            <Ionicons name="notifications-outline" size={18} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Body size={16} bold>
                تذكير صباحي ومسائي
              </Body>
              <Body size={11.5} color={colors.muted}>
                {remindersSupported
                  ? 'إشعارات محلية يومية تعمل دون إنترنت'
                  : 'يُفعّل في نسخة الأندرويد'}
              </Body>
            </View>
            <Switch
              value={preferences.remindersEnabled}
              onValueChange={onToggleReminders}
              trackColor={{ false: colors.surfaceAlt, true: colors.success }}
              thumbColor={Platform.OS === 'android' ? colors.surface : undefined}
            />
          </View>

          <Divider color={colors.border} />

          <TimeRow
            label="أذكار الصباح"
            icon="sunny-outline"
            value={preferences.morning}
            onPress={() => updateTime('morning')}
            disabled={!preferences.remindersEnabled}
          />
          <TimeRow
            label="أذكار المساء"
            icon="moon-outline"
            value={preferences.evening}
            onPress={() => updateTime('evening')}
            disabled={!preferences.remindersEnabled}
          />

          <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: colors.muted, textAlign: 'right' }}>
            اضغط على الوقت لتغييره بالخطوة التالية. تُجدول الإشعارات محليًا على الجهاز.
          </Text>
        </Card>

        {notice ? (
          <View
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              borderRadius: radius.md,
              backgroundColor: notice.tone === 'ok' ? `${colors.success}22` : `${colors.danger}22`,
              borderWidth: 1,
              borderColor: notice.tone === 'ok' ? colors.success : colors.danger,
            }}
          >
            <Ionicons
              name={notice.tone === 'ok' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
              size={17}
              color={notice.tone === 'ok' ? colors.success : colors.danger}
            />
            <Text
              style={{
                flex: 1,
                fontFamily: fonts.body,
                fontSize: 12.5,
                color: colors.text,
                textAlign: 'right',
                writingDirection: 'rtl',
              }}
            >
              {notice.text}
            </Text>
          </View>
        ) : null}

        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <View style={{ height: 92, justifyContent: 'center' }}>
            <StarPattern color={colors.gold} opacity={0.14} size={36} />
            <View
              style={{
                position: 'absolute',
                inset: 10,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: colors.goldSoft,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 19,
                  color: colors.primary,
                  textAlign: 'center',
                }}
              >
                حِصْنُ المُسْلِم
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>
                {`المصدر: أذكار الكتاب والسنة · الوضع ${mode === 'dark' ? 'الليلي' : 'النهاري'}`}
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ marginTop: 4 }}>
          <PrimaryButton label="تصفّح الأبواب" icon="book-outline" onPress={() => router.push('/browse')} />
        </View>

        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 11,
            color: colors.muted,
            textAlign: 'center',
            marginTop: 4,
            writingDirection: 'rtl',
          }}
        >
          جميع الأذكار والأدعية مأخوذة كما هي من قاعدة بيانات «حصن المسلم».
        </Text>
      </View>
    </Screen>
  );
}

function TimeRow({
  label,
  icon,
  value,
  onPress,
  disabled,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: ReminderTime;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={`تغيير وقت ${label}`}
      style={({ pressed }) => ({
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: radius.sm,
        backgroundColor: colors.surfaceAlt,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <Ionicons name={icon} size={17} color={colors.gold} />
      <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 14.5, color: colors.text, textAlign: 'right' }}>
        {label}
      </Text>
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primary }}>
        {formatTimeLabel(value)}
      </Text>
      <Ionicons name="chevron-back" size={15} color={colors.muted} />
    </Pressable>
  );
}
