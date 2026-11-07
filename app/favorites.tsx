import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, EmptyState, Header, PrimaryButton, Screen } from '@/components/ui';
import { radius } from '@/constants/theme';
import { arNum } from '@/lib/arabic';
import { adhkarById, getCategory } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/use-theme';

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors, fonts } = useTheme();
  const { favorites, toggleFavorite, progress } = useStore();

  const items = favorites.map((id) => adhkarById.get(id)).filter((z): z is NonNullable<typeof z> => Boolean(z));

  return (
    <Screen edges={['top']}>
      <Header
        title="المفضلة"
        subtitle={items.length ? `${arNum(items.length)} ذكرًا محفوظًا` : 'أذكارك المحفوظة تظهر هنا'}
        onBack={() => router.back()}
      />

      {items.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="لا أذكار في المفضلة"
          message="افتح أي ذكر واضغط رمز القلب لحفظه هنا والرجوع إليه بسرعة."
          action={
            <PrimaryButton label="تصفّح الأبواب" icon="book-outline" onPress={() => router.push('/browse')} />
          }
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const category = getCategory(item.categoryId);
            const count = progress[String(item.id)] ?? 0;
            return (
              <Pressable
                onPress={() => router.push(`/zekr/${item.id}`)}
                style={({ pressed }) => ({
                  gap: 8,
                  padding: 14,
                  borderRadius: radius.md,
                  backgroundColor: colors.surface,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                  <Text
                    numberOfLines={1}
                    style={{ flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.gold, textAlign: 'right' }}
                  >
                    {category?.shortTitle ?? ''}
                  </Text>
                  <Pressable
                    onPress={() => toggleFavorite(item.id)}
                    hitSlop={10}
                    accessibilityLabel="إزالة من المفضلة"
                  >
                    <Ionicons name="heart" size={18} color={colors.gold} />
                  </Pressable>
                </View>
                <Body size={16} numberOfLines={3}>
                  {item.text}
                </Body>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: colors.muted }}>
                    {item.repeat > 1 ? `يُقال ${arNum(item.repeat)} مرات` : 'مرة واحدة'}
                  </Text>
                  {count > 0 ? (
                    <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: colors.success }}>
                      {`· ${arNum(count)}/${arNum(item.repeat)}`}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}
