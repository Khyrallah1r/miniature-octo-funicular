import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Card, Header, Screen } from '@/components/ui';
import { radius } from '@/constants/theme';
import { arNum } from '@/lib/arabic';
import { TOTAL_CATEGORIES, categories, chapterProgress, getCategoryZekr } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useTheme } from '@/lib/use-theme';

type Filter = 'all' | 'featured' | 'short';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'كل الأبواب' },
  { key: 'featured', label: 'الأبواب المميزة' },
  { key: 'short', label: 'أبواب قصيرة' },
];

export default function BrowseScreen() {
  const router = useRouter();
  const { colors, fonts } = useTheme();
  const { progress } = useStore();
  const [filter, setFilter] = useState<Filter>('all');

  const list = useMemo(() => {
    if (filter === 'featured') return categories.filter((c) => c.featured);
    if (filter === 'short') {
      return categories.filter((c) => {
        const count = getCategoryZekr(c.id).length;
        return count > 0 && count <= 2;
      });
    }
    return categories;
  }, [filter]);

  return (
    <Screen edges={['top']}>
      <Header title="أبواب الحصن" subtitle={`${arNum(TOTAL_CATEGORIES)} بابًا في الأذكار والأدعية`} onBack={() => router.back()} />

      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={{
            flexDirection: 'row-reverse',
            gap: 8,
            backgroundColor: colors.surfaceAlt,
            padding: 4,
            borderRadius: radius.pill,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
          }}
        >
          {FILTERS.map((item) => {
            const active = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: radius.pill,
                  backgroundColor: active ? colors.primary : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.bodyBold,
                    fontSize: 13,
                    color: active ? colors.onPrimary : colors.muted,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 14 }}>
        <Card style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
          <FlatListBody list={list} progress={progress} onPress={(id) => router.push(`/category/${id}`)} />
        </Card>
      </View>
    </Screen>
  );
}

function FlatListBody({
  list,
  progress,
  onPress,
}: {
  list: typeof categories;
  progress: Record<string, number>;
  onPress: (id: number) => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <FlatList
      data={list}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingVertical: 4 }}
      ItemSeparatorComponent={() => (
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
      )}
      ListEmptyComponent={
        <View style={{ padding: 28 }}>
          <Body align="center" color={colors.muted}>
            لا توجد أبواب مطابقة لهذا التصفية.
          </Body>
        </View>
      }
      renderItem={({ item, index }) => {
        const { done, total } = chapterProgress(item.id, progress);
        const complete = total > 0 && done === total;
        return (
          <Pressable
            onPress={() => onPress(item.id)}
            style={({ pressed }) => ({
              flexDirection: 'row-reverse',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 14,
              paddingVertical: 13,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.sm,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: complete ? colors.primary : colors.surfaceAlt,
                borderWidth: 1,
                borderColor: complete ? colors.primary : colors.goldSoft,
              }}
            >
              {complete ? (
                <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
              ) : (
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: colors.gold }}>
                  {arNum(index + 1)}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Body size={15} numberOfLines={2}>
                {item.title.trim()}
              </Body>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>
                  {`${arNum(total)} ${total === 1 ? 'ذكر' : 'أذكار'}`}
                </Text>
                {item.featured ? (
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: colors.gold,
                    }}
                  />
                ) : null}
                {done > 0 ? (
                  <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.success }}>
                    {`· ${arNum(done)}/${arNum(total)}`}
                  </Text>
                ) : null}
              </View>
            </View>
            <Ionicons name="chevron-back" size={16} color={colors.muted} />
          </Pressable>
        );
      }}
    />
  );
}

