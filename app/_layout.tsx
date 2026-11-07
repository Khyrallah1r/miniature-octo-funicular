import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { ArefRuqaa_400Regular } from '@expo-google-fonts/aref-ruqaa';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { StoreProvider, useStore } from '@/lib/store';
import { useTheme } from '@/lib/use-theme';

function RootShell() {
  const { hydrated, preferences } = useStore();
  const { mode, colors } = useTheme();

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_left',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="browse" />
        <Stack.Screen name="search" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="zekr/[id]" />
      </Stack>
      <View
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={{ backgroundColor: preferences.themeMode === 'dark' ? '#000' : '#fff' }} />
      </View>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    ArefRuqaa_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      // Keep the splash screen logic minimal; layout renders once fonts are ready.
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F6EFDF' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <RootShell />
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
