import { color } from '@zen-mahjong/design-tokens';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppDataProvider } from '@/state/app-data-provider';
import { useAppResources } from '@/theme/app-resources';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { ready } = useAppResources();

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return null;

  return (
    <AppDataProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: color.background.base },
          headerShown: false,
        }}
      />
    </AppDataProvider>
  );
}
