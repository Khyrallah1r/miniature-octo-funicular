import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArchOutline, Divider, StarPattern } from '@/components/ornaments';
import { EmptyState, Header, Screen } from '@/components/ui';
import { radius, readingSize } from '@/constants/theme';
import { arNum } from '@/lib/arabic';
import {
  adhkarById,
  getCategory,
  getNextChapterFirstZekr,
  getZekrPosition,
} from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/use-theme';

const ADVANCE_DELAY = 750;

export default function ZekrScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const zekrId = Number(params.id);
  const { colors, fonts, fontScale, mode } = useTheme();
  const { countOf, bumpCount, isFavorite, toggleFavorite, preferences, setPreferences } = useStore();

  const [toast, setToast] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [finishedAll, setFinishedAll] = useState(false);
  const advancingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const zekr = adhkarById.get(zekrId);
  const position = useMemo(() => (zekr ? getZekrPosition(zekr) : null), [zekr]);
  const category = zekr ? getCategory(zekr.categoryId) : undefined;

  const nextZekr = position?.list[position.index + 1];
  const prevZekr = position ? position.list[position.index - 1] : undefined;

  useEffect(() => {
    advancingRef.current = false;
    setAdvancing(false);
    setFinishedAll(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [zekrId]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  if (!zekr || !position || !category) {
    return (
      <Screen>
        <Header title="ذكر غير موجود" onBack={() => router.back()} />
        <EmptyState
          icon="alert-circle-outline"
          title="لم نجد هذا الذكر"
          message="عُد إلى قائمة الأبواب واختر ذكرًا آخر."
        />
      </Screen>
    );
  }

  const count = countOf(zekr.id);
  const complete = count >= zekr.repeat;
  const favorite = isFavorite(zekr.id);
  const nextChapterZekr = nextZekr ? undefined : getNextChapterFirstZekr(zekr.categoryId);
  const advanceTargetId = nextZekr?.id ?? nextChapterZekr?.id;

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1800);
  };

  const advance = () => {
    if (advanceTargetId) {
      router.replace(`/zekr/${advanceTargetId}`);
      return;
    }
    setFinishedAll(true);
  };

  const onCount = () => {
    if (advancingRef.current || complete) return;

    const nextCount = count + 1;
    bumpCount(zekr.id);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }

    if (nextCount < zekr.repeat) return;

    advancingRef.current = true;
    setAdvancing(true);
    if (!advanceTargetId) setFinishedAll(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      advance();
    }, ADVANCE_DELAY);
  };

  const onCopy = async () => {
    await Clipboard.setStringAsync(zekr.text);
    flash('تم نسخ الذكر');
  };

  const onShare = async () => {
    try {
      await Share.share({ message: `${zekr.text}\n\n— ${category.shortTitle} · حصن المسلم` });
    } catch {
      flash('تعذّرت المشاركة');
    }
  };

  const bodySize = Math.round(readingSize.base * fontScale);
  const ringSize = 118;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Header
        title={category.shortTitle}
        subtitle={`الذكر ${arNum(position.index + 1)} من ${arNum(position.list.length)}`}
        onBack={() => router.back()}
        right={
          <Pressable
            onPress={() => toggleFavorite(zekr.id)}
            accessibilityLabel={favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            style={{
              width: 42,
              height: 42,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: favorite ? colors.gold : colors.surface,
              borderWidth: 1,
              borderColor: favorite ? colors.gold : colors.border,
            }}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={19}
              color={favorite ? colors.primaryDark : colors.primary}
            />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={mode === 'dark' ? ['#16241F', '#111C18'] : ['#FBF5E6', '#F4EBD7']}
            style={{ paddingHorizontal: 18, paddingTop: 22, paddingBottom: 16 }}
          >
            <StarPattern color={colors.gold} opacity={0.09} size={40} />
            <View style={{ position: 'absolute', inset: 0, opacity: 0.16 }} pointerEvents="none">
              <ArchOutline color={colors.gold} opacity={0.5} />
            </View>

            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: colors.goldSoft,
                  backgroundColor:
                    mode === 'dark' ? 'rgba(211,174,101,0.10)' : 'rgba(168,129,60,0.08)',
                }}
              >
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: colors.gold }}>
                  {zekr.repeat > 1 ? `يُقال ${arNum(zekr.repeat)} مرات` : 'يُقال مرة واحدة'}
                </Text>
              </View>
            </View>

            <Text
              selectable
              style={{
                fontFamily: fonts.body,
                fontSize: bodySize,
                lineHeight: bodySize * readingSize.lineHeightRatio,
                color: colors.text,
                textAlign: 'center',
                writingDirection: 'rtl',
              }}
            >
              {zekr.text}
            </Text>

            <View style={{ marginTop: 18, marginBottom: 4 }}>
              <Divider color={colors.gold} />
            </View>

            {zekr.source ? (
              <View style={{ flexDirection: 'row-reverse', gap: 6, alignItems: 'flex-start' }}>
                <Ionicons name="bookmark-outline" size={13} color={colors.gold} style={{ marginTop: 4 }} />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: fonts.body,
                    fontSize: 12.5,
                    lineHeight: 21,
                    color: colors.muted,
                    textAlign: 'right',
                    writingDirection: 'rtl',
                  }}
                >
                  {zekr.source}
                </Text>
              </View>
            ) : null}
          </LinearGradient>
        </View>

        {toast ? (
          <View
            style={{
              alignSelf: 'center',
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: radius.pill,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.onPrimary }}>
              {toast}
            </Text>
          </View>
        ) : null}

        <View style={{ alignItems: 'center', gap: 8, paddingVertical: 6 }}>
          <Pressable
            onPress={onCount}
            disabled={complete}
            accessibilityRole="button"
            accessibilityLabel={complete ? 'تم إتمام هذا الذكر' : 'زد العدّاد'}
            style={({ pressed }) => ({
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: complete ? colors.success : colors.primary,
              borderWidth: 4,
              borderColor: complete ? `${colors.success}55` : colors.gold,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 40,
                lineHeight: 56,
                color: colors.onPrimary,
              }}
            >
              {arNum(count)}
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.onPrimary, opacity: 0.85 }}>
              {complete ? 'تم بحمد الله' : `من ${arNum(zekr.repeat)}`}
            </Text>
          </Pressable>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: advancing ? colors.success : colors.muted,
              textAlign: 'center',
            }}
          >
            {advancing
              ? finishedAll
                ? 'أتممت الحصن بحمد الله'
                : 'تم الإتمام — الانتقال إلى الذكر التالي…'
              : complete
                ? 'انتقل تلقائيًا إلى الذكر التالي'
                : 'اضغط العدّاد بعد كل ذكر'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
          <ActionTile icon="copy-outline" label="نسخ" onPress={onCopy} />
          <ActionTile icon="share-social-outline" label="مشاركة" onPress={onShare} />
          <ActionTile
            icon={preferences.themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
            label="الوضع الليلي"
            onPress={() =>
              setPreferences({
                themeMode: preferences.themeMode === 'dark' ? 'light' : 'dark',
              })
            }
          />
        </View>

        <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 2 }}>
          <NavButton
            label="السابق"
            icon="chevron-forward"
            disabled={!prevZekr}
            onPress={() => prevZekr && router.replace(`/zekr/${prevZekr.id}`)}
          />
          <NavButton
            label={nextZekr ? 'التالي' : nextChapterZekr ? 'الباب التالي' : 'اكتمل الحصن'}
            icon={nextZekr ? 'chevron-back' : 'arrow-back'}
            disabled={!advanceTargetId}
            onPress={() => advanceTargetId && router.replace(`/zekr/${advanceTargetId}`)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        gap: 5,
        paddingVertical: 11,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.text }}>{label}</Text>
    </Pressable>
  );
}

function NavButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minHeight: 48,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: colors.gold,
        opacity: disabled ? 0.35 : pressed ? 0.8 : 1,
      })}
    >
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: colors.primary }}>{label}</Text>
    </Pressable>
  );
}
