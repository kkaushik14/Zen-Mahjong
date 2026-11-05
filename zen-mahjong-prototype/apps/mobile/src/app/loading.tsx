import { router } from 'expo-router';
import { useEffect } from 'react';

import { LoadingScreen } from '@/features/loading/loading-screen';
import { useAppData } from '@/state/app-data-provider';

export default function LoadingRoute() {
  const { settings } = useAppData();

  useEffect(() => {
    const timeout = setTimeout(() => router.replace('/'), settings.reducedMotion ? 150 : 900);
    return () => clearTimeout(timeout);
  }, [settings.reducedMotion]);

  return <LoadingScreen />;
}
