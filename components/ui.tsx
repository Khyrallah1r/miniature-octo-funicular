import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StarPattern } from '@/components/ornaments';
import { radius } from '@/constants/theme';
import { useTheme } from '@/lib/use-theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Screen({
  children,
  scroll = false,
  pattern = false,
  contentStyle,
  edges = ['top'],
}: {
  children: ReactNode;
  scroll?: boolean;
  pattern?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ('top' | 'bottom')[];
}) {
  const { colors } = useTheme();
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[{ paddingBottom: 32 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={edges}>
      {pattern ? <StarPattern color={colors.gold} opacity={0.07} /> : null}
      {body}
    </SafeAreaView>
  );
}

export function AppTitle({ children, size = 26 }: { children: ReactNode; size?: number }) {
  const { colors, fonts } = useTheme();
  return (
    <Text
      style={{
        fontFamily: fonts.display,
        fontSize: size,
        lineHeight: size * 1.6,
        color: colors.primary,
        textAlign: 'right',
        writingDirection: 'rtl',
      }}
    >
      {children}
    </Text>
  );
}

export function Body({
  children,
  size = 15,
  color,
  align = 'right',
  bold = false,
  numberOfLines,
  style,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  align?: 'right' | 'center' | 'left';
  bold?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontFamily: bold ? fonts.bodyBold : fonts.body,
          fontSize: size,
          lineHeight: size * 1.7,
          color: color ?? colors.text,
          textAlign: align,
          writingDirection: 'rtl',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  active = false,
  tone = 'surface',
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  active?: boolean;
  tone?: 'surface' | 'ghost';
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 42,
        height: 42,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: tone === 'surface' ? 1 : 0,
        borderColor: colors.border,
        backgroundColor: active ? colors.primary : tone === 'surface' ? colors.surface : 'transparent',
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={active ? colors.onPrimary : colors.primary} />
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  variant = 'solid',
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  variant?: 'solid' | 'outline' | 'gold';
}) {
  const { colors, fonts } = useTheme();
  const solid = variant === 'solid';
  const gold = variant === 'gold';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 50,
        paddingHorizontal: 20,
        borderRadius: radius.md,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: solid || gold ? 0 : 1.5,
        borderColor: colors.gold,
        backgroundColor: solid ? colors.primary : gold ? colors.gold : 'transparent',
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
      })}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={solid ? colors.onPrimary : gold ? colors.primaryDark : colors.primary}
        />
      ) : null}
      <Text
        style={{
          fontFamily: fonts.bodyBold,
          fontSize: 16,
          color: solid ? colors.onPrimary : gold ? colors.primaryDark : colors.primary,
          writingDirection: 'rtl',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const { colors, fonts } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
      }}
    >
      {onBack ? (
        <IconButton icon="chevron-forward" label="رجوع" onPress={onBack} tone="ghost" />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fonts.display,
            fontSize: 21,
            color: colors.text,
            textAlign: 'right',
            writingDirection: 'rtl',
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.muted,
              textAlign: 'right',
              writingDirection: 'rtl',
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  accessibilityLabel,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, style, { opacity: pressed ? 0.85 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  const { colors, fonts } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.bodyBold,
          fontSize: 18,
          color: colors.text,
          textAlign: 'right',
          writingDirection: 'rtl',
        }}
      >
        {children}
      </Text>
      {action}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: IconName;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 56, paddingHorizontal: 32, gap: 10 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surfaceAlt,
          borderWidth: 1,
          borderColor: colors.goldSoft,
          marginBottom: 4,
        }}
      >
        <Ionicons name={icon} size={30} color={colors.gold} />
      </View>
      <Body size={18} bold align="center" color={colors.text}>
        {title}
      </Body>
      <Body size={14} align="center" color={colors.muted}>
        {message}
      </Body>
      <View style={{ marginTop: 8, alignSelf: 'stretch', maxWidth: 260 }}>{action}</View>
    </View>
  );
}

export function Sheet({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          borderRadius: radius.lg,
          padding: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function GradientPanel({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, mode } = useTheme();
  return (
    <View style={[{ borderRadius: radius.lg, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={
          mode === 'dark'
            ? ['#123B2F', '#0C241D', '#0A1F19']
            : ['#12503D', '#0E4636', '#0A362A']
        }
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ padding: 18 }}
      >
        <View
          style={{
            position: 'absolute',
            inset: 0,
            borderWidth: 1,
            borderColor: 'rgba(211,174,101,0.35)',
            borderRadius: radius.lg,
            margin: 6,
          }}
        />
        {children}
        <View
          style={{
            position: 'absolute',
            left: -30,
            bottom: -30,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(211,174,101,0.10)',
          }}
        />
        <Text style={{ position: 'absolute', right: 8, bottom: 4, fontSize: 10, color: colors.goldSoft }}>
          {'\u200b'}
        </Text>
      </LinearGradient>
    </View>
  );
}

export function Spinner() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.gold} />
    </View>
  );
}
