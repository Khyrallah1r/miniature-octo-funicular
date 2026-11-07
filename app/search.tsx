import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Body, EmptyState, Screen } from '@/components/ui';
import { radius } from '@/constants/theme';
import { arNum, excerpt, findMatches, normalizeArabic } from '@/lib/arabic';
import { categories, getCategory, searchAll, type Category, type Zekr } from '@/lib/data';
import { useTheme } from '@/lib/use-theme';

const SUGGESTIONS = ['الصباح', 'المساء', 'النوم', 'الوضوء', 'السفر', 'الاستغفار', 'الكرب'];

export default function SearchScreen() {
  const router = useRouter();
  const { colors, fonts } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchAll(query), [query]);
  const categoryResults = results.filter((r) => r.kind === 'category');
  const zekrResults = results.filter((r) => r.kind === 'zekr');
  const hasQuery = normalizeArabic(query).length >= 2;

  return (
    <Screen edges={['top']}>
      <View
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 10,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="رجوع">
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>
        <View
          style={{
            flex: 1,
            flexDirection: 'row-reverse',
            alignItems: 'center',
            gap: 8,
            height: 46,
            paddingHorizontal: 12,
            borderRadius: radius.pill,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput
            ref={inputRef}
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث بكلمة من الذكر أو اسم الباب…"
            placeholderTextColor={colors.muted}
            style={{
              flex: 1,
              fontFamily: fonts.body,
              fontSize: 15,
              color: colors.text,
              textAlign: 'right',
              writingDirection: 'rtl',
              paddingVertical: 0,
            }}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="مسح البحث">
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!hasQuery ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Body size={16} bold style={{ marginBottom: 8 }}>
            ابحث بالكلمات الشائعة
          </Body>
          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map((word) => (
              <Pressable
                key={word}
                onPress={() => setQuery(word)}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: colors.text }}>{word}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: 24 }}>
            <Body size={16} bold style={{ marginBottom: 8 }}>
              أبواب مميزة
            </Body>
            <View style={{ gap: 8 }}>
              {categories
                .filter((c) => c.featured)
                .map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => router.push(`/category/${category.id}`)}
                    style={{
                      flexDirection: 'row-reverse',
                      alignItems: 'center',
                      gap: 10,
                      padding: 12,
                      borderRadius: radius.md,
                      backgroundColor: colors.surface,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: colors.border,
                    }}
                  >
                    <Ionicons name="book-outline" size={16} color={colors.gold} />
                    <Body size={14.5} numberOfLines={1} style={{ flex: 1 }}>
                      {category.shortTitle}
                    </Body>
                    <Ionicons name="chevron-back" size={15} color={colors.muted} />
                  </Pressable>
                ))}
            </View>
          </View>
        </ScrollView>
      ) : results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="لا نتائج مطابقة"
          message="جرّب كلمة أقصر أو من دون تشكيل، مثل «استغفار» أو «سفر»."
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, gap: 10 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, textAlign: 'right' }}>
            {`${arNum(results.length)} نتيجة`}
          </Text>

          {categoryResults.map((result) => (
            <CategoryHit key={`c-${result.category.id}`} category={result.category} query={query} />
          ))}

          {zekrResults.map((result) => (
            <ZekrHit key={`z-${result.zekr.id}`} zekr={result.zekr} query={query} />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function CategoryHit({ category, query }: { category: Category; query: string }) {
  const router = useRouter();
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/category/${category.id}`)}
      style={({ pressed }) => ({
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
        }}
      >
        <Ionicons name="albums-outline" size={15} color={colors.onPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gold }}>باب</Text>
        <Highlighted text={category.title.trim()} query={query} size={15} bold />
      </View>
      <Ionicons name="chevron-back" size={15} color={colors.muted} />
    </Pressable>
  );
}

function ZekrHit({ zekr, query }: { zekr: Zekr; query: string }) {
  const router = useRouter();
  const { colors, fonts } = useTheme();
  const category = getCategory(zekr.categoryId);
  const snippet = excerpt(zekr.text, query, 120);
  return (
    <Pressable
      onPress={() => router.push(`/zekr/${zekr.id}`)}
      style={({ pressed }) => ({
        gap: 6,
        padding: 14,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
        <Ionicons name="bookmark-outline" size={12} color={colors.gold} />
        <Text
          numberOfLines={1}
          style={{ flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.gold, textAlign: 'right' }}
        >
          {category?.shortTitle ?? ''}
        </Text>
      </View>
      <Highlighted text={snippet} query={query} size={15.5} lines={3} />
    </Pressable>
  );
}

function Highlighted({
  text,
  query,
  size,
  bold = false,
  lines,
}: {
  text: string;
  query: string;
  size: number;
  bold?: boolean;
  lines?: number;
}) {
  const { colors, fonts } = useTheme();
  const ranges = useMemo(() => findMatches(text, query), [text, query]);
  const baseStyle = {
    fontFamily: bold ? fonts.bodyBold : fonts.body,
    fontSize: size,
    lineHeight: size * 1.75,
    color: colors.text,
    textAlign: 'right' as const,
    writingDirection: 'rtl' as const,
  };

  if (!ranges.length) {
    return (
      <Text numberOfLines={lines} style={baseStyle}>
        {text}
      </Text>
    );
  }

  const pieces: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (range.start > cursor) {
      pieces.push(text.slice(cursor, range.start));
    }
    pieces.push(
      <Text
        key={`m-${index}`}
        style={{ backgroundColor: `${colors.gold}44`, color: colors.text }}
      >
        {text.slice(range.start, range.end)}
      </Text>
    );
    cursor = range.end;
  });
  if (cursor < text.length) pieces.push(text.slice(cursor));

  return (
    <Text numberOfLines={lines} style={baseStyle}>
      {pieces}
    </Text>
  );
}
