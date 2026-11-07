import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Divider } from '@/components/ornaments';
import { Body, EmptyState, GradientPanel, Header, Screen } from '@/components/ui';
import { radius } from '@/constants/theme';
import { arNum } from '@/lib/arabic';
import { chapterProgress, getCategory, getCategoryZekr } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/use-theme';

export default function CategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(params.id);
  const { colors, fonts } = useTheme();
  const { progress, resetChapter, isFavorite, setLastCategory } = useStore();

  const category = getCategory(categoryId);
  const list = useMemo(() => getCategoryZekr(categoryId), [categoryId]);
  const { done, total } = chapterProgress(categoryId, progress);

  useEffect(() => {
    if (category) setLastCategory(category.id);
  }, [category, setLastCategory]);

  if (!category) {
    return (
      <Screen>
        <Header title="باب غير موجود" onBack={() => router.back()} />
        <EmptyState
          icon="alert-circle-outline"
          title="لم نجد هذا الباب"
          message="قد يكون الرابط غير صحيح. عُد إلى قائمة الأبواب واختر بابًا آخر."
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <Header
        title={category.title.trim()}
        subtitle={`${arNum(total)} ${total === 1 ? 'ذكر' : 'أذكار'} · أتممت ${arNum(done)}`}
        onBack={() => router.back()}
        right={
          done > 0 ? (
            <Pressable
              onPress={() => resetChapter(categoryId)}
              hitSlop={8}
              accessibilityLabel="إعادة تصفير عدّادات هذا الباب"
              style={{
                paddingHorizontal: 10,
                paddingVertical: 7,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
                تصفير الباب
              </Text>
            </Pressable>
          ) : null
        }
      />

      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ marginBottom: 6 }}>
            <GradientPanel>
              <View style={{ alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                <Ionicons name="book-outline" size={22} color="#D3AE65" />
                <Text
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 20,
                    color: '#F5E9CC',
                    textAlign: 'center',
                    writingDirection: 'rtl',
                    lineHeight: 34,
                  }}
                >
                  {category.shortTitle}
                </Text>
                <Divider color="rgba(211,174,101,0.65)" />
                <View style={{ flexDirection: 'row-reverse', gap: 14 }}>
                  <Pill label={`${arNum(total)} أذكار`} />
                  <Pill label={`أتممت ${arNum(done)}`} />
                </View>
              </View>
            </GradientPanel>
          </View>
        }
        renderItem={({ item, index }) => {
          const count = progress[String(item.id)] ?? 0;
          const complete = count >= item.repeat;
          return (
            <Pressable
              onPress={() => router.push(`/zekr/${item.id}`)}
              style={({ pressed }) => ({
                flexDirection: 'row-reverse',
                gap: 12,
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: complete ? colors.success : colors.border,
                padding: 14,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: complete ? colors.success : colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: complete ? colors.success : colors.goldSoft,
                }}
              >
                {complete ? (
                  <Ionicons name="checkmark" size={17} color={colors.surface} />
                ) : (
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: colors.gold }}>
                    {arNum(index + 1)}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1, gap: 6 }}>
                <Body size={16} numberOfLines={3}>
                  {item.text}
                </Body>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: radius.pill,
                      backgroundColor: colors.surfaceAlt,
                    }}
                  >
                    <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>
                      {item.repeat > 1 ? `التكرار ${arNum(item.repeat)}` : 'مرة واحدة'}
                    </Text>
                  </View>
                  {count > 0 ? (
                    <Text
                      style={{
                        fontFamily: fonts.body,
                        fontSize: 11,
                        color: complete ? colors.success : colors.gold,
                      }}
                    >
                      {`${arNum(count)}/${arNum(item.repeat)}`}
                    </Text>
                  ) : null}
                  {isFavorite(item.id) ? (
                    <Ionicons name="heart" size={13} color={colors.gold} />
                  ) : null}
                </View>
              </View>

              <Ionicons name="chevron-back" size={16} color={colors.muted} style={{ marginTop: 6 }} />
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D3AE65' }} />
      <Text style={{ fontSize: 12, color: '#CFC0A0' }}>{label}</Text>
    </View>
  );
}
