import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StarPattern } from '@/components/ornaments';
import { Body, Card, GradientPanel, Screen } from '@/components/ui';
import { radius } from '@/constants/theme';
import {
  TOTAL_CATEGORIES,
  TOTAL_ZEKR,
  categories,
  chapterProgress,
  getCategory,
  getCategoryZekr,
} from '@/lib/data';
import { arNum } from '@/lib/arabic';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/use-theme';

const QUICK = [
  { id: 27, icon: 'sunny-outline', label: 'الصباح', hint: 'بداية اليوم' },
  { id: 28, icon: 'moon-outline', label: 'المساء', hint: 'ختام اليوم' },
  { id: 29, icon: 'bed-outline', label: 'النوم', hint: 'قبل النوم' },
  { id: 1, icon: 'partly-sunny-outline', label: 'الاستيقاظ', hint: 'بعد النوم' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { colors, fonts, mode } = useTheme();
  const { preferences, progress, favorites, lastCategoryId } = useStore();

  const resume = lastCategoryId ? getCategory(lastCategoryId) : undefined;
  const resumeProgress = resume ? chapterProgress(resume.id, progress) : null;

  const totalDone = useMemo(
    () => Object.values(progress).filter((value) => value > 0).length,
    [progress]
  );

  return (
    <Screen scroll pattern>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <View
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <RoundAction
              icon={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              label="تبديل الوضع الليلي"
              onPress={() => router.push('/settings')}
            />
            <RoundAction icon="settings-outline" label="الإعدادات" onPress={() => router.push('/settings')} />
          </View>
          <Pressable
            onPress={() => router.push('/search')}
            style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              gap: 8,
              flex: 1,
              marginLeft: 10,
              height: 44,
              paddingHorizontal: 14,
              borderRadius: radius.pill,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.muted,
                writingDirection: 'rtl',
              }}
            >
              ابحث في الأذكار والأبواب…
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 18 }}>
          <GradientPanel>
            <StarPattern color="#D3AE65" opacity={0.16} size={38} />
            <View style={{ alignItems: 'center', gap: 6, paddingVertical: 6 }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: '#C6B58C' }}>
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </Text>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 34,
                  lineHeight: 58,
                  color: '#F5E9CC',
                  textAlign: 'center',
                }}
              >
                حِصْنُ المُسْلِم
              </Text>
              <View style={{ width: 130, height: 1, backgroundColor: 'rgba(211,174,101,0.55)' }} />
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: '#CFC0A0',
                  textAlign: 'center',
                  writingDirection: 'rtl',
                }}
              >
                أذكار الكتاب والسنة — {arNum(TOTAL_CATEGORIES)} بابًا و{arNum(TOTAL_ZEKR)} ذكرًا
              </Text>
            </View>
          </GradientPanel>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <Body size={18} bold>
          أذكار الساعة
        </Body>
        <View style={{ flexDirection: 'row-reverse', gap: 10, marginTop: 10 }}>
          {QUICK.map((item) => {
            const category = getCategory(item.id);
            if (!category) return null;
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/category/${item.id}`)}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 6,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor: colors.goldSoft,
                  }}
                >
                  <Ionicons name={item.icon} size={19} color={colors.gold} />
                </View>
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 14,
                    color: colors.text,
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>
                  {arNum(getCategoryZekr(item.id).length)} ذكرًا
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {resume && resumeProgress ? (
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <Body size={18} bold>
            متابعة القراءة
          </Body>
          <Card
            style={{ marginTop: 10, padding: 14 }}
            onPress={() => router.push(`/category/${resume.id}`)}
            accessibilityLabel={`متابعة ${resume.shortTitle}`}
          >
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: radius.pill,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="bookmark" size={18} color={colors.onPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Body size={16} bold numberOfLines={1}>
                  {resume.shortTitle}
                </Body>
                <Body size={12} color={colors.muted} style={{ marginTop: 2 }}>
                  {`أتممت ${arNum(resumeProgress.done)} من ${arNum(resumeProgress.total)} أذكار`}
                </Body>
              </View>
              <Ionicons name="chevron-back" size={18} color={colors.muted} />
            </View>
          </Card>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <View
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <Body size={18} bold>
            أبواب الحصن
          </Body>
          <Pressable onPress={() => router.push('/browse')} hitSlop={8}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold }}>
              كل الأبواب ({arNum(TOTAL_CATEGORIES)})
            </Text>
          </Pressable>
        </View>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {categories.slice(0, 6).map((category, index) => {
            const { done, total } = chapterProgress(category.id, progress);
            return (
              <Pressable
                key={category.id}
                onPress={() => router.push(`/category/${category.id}`)}
                style={({ pressed }) => ({
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 13,
                  paddingHorizontal: 14,
                  borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 13,
                    color: colors.gold,
                    width: 26,
                    textAlign: 'center',
                  }}
                >
                  {arNum(index + 1)}
                </Text>
                <View style={{ flex: 1 }}>
                  <Body size={15} numberOfLines={1}>
                    {category.title.trim()}
                  </Body>
                  <Body size={11} color={colors.muted}>
                    {done > 0
                      ? `${arNum(total)} ذكرًا · أتممت ${arNum(done)}`
                      : `${arNum(total)} ذكرًا`}
                  </Body>
                </View>
                <Ionicons name="chevron-back" size={16} color={colors.muted} />
              </Pressable>
            );
          })}
        </Card>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
          <Pressable
            onPress={() => router.push('/favorites')}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: radius.md,
              padding: 14,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 6,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons name="heart" size={20} color={colors.gold} />
            <Body size={15} bold>
              المفضلة
            </Body>
            <Body size={11} color={colors.muted}>
              {favorites.length ? `${arNum(favorites.length)} ذكرًا محفوظًا` : 'لم تحفظ أذكارًا بعد'}
            </Body>
          </Pressable>

          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => ({
              flex: 1,
              borderRadius: radius.md,
              padding: 14,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 6,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ionicons
              name={preferences.remindersEnabled ? 'notifications' : 'notifications-outline'}
              size={20}
              color={colors.gold}
            />
            <Body size={15} bold>
              التذكيرات
            </Body>
            <Body size={11} color={colors.muted}>
              {preferences.remindersEnabled ? 'مفعّلة صباحًا ومساءً' : 'غير مفعّلة'}
            </Body>
          </Pressable>
        </View>
      </View>

      <View style={{ alignItems: 'center', marginTop: 24, gap: 2 }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
          {`أذكار مقروءة: ${arNum(totalDone)} من ${arNum(TOTAL_ZEKR)}`}
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>
          المصدر: حصن المسلم — أذكار الكتاب والسنة
        </Text>
      </View>
    </Screen>
  );
}

function RoundAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={19} color={colors.primary} />
    </Pressable>
  );
}
