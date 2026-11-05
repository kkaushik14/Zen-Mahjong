import { useEffect, useState } from 'react';

import { HomeScreen } from '@/features/home/home-screen';
import { useAppData } from '@/state/app-data-provider';

import { LoadingScreen } from './loading-screen';

let startupPresentationCompleted = false;

export function StartupEntry() {
  const { settings } = useAppData();
  const [showLoading, setShowLoading] = useState(!startupPresentationCompleted);

  useEffect(() => {
    if (!showLoading) return;
    const duration = settings.reducedMotion ? 150 : 900;
    const timeout = setTimeout(() => {
      startupPresentationCompleted = true;
      setShowLoading(false);
    }, duration);
    return () => clearTimeout(timeout);
  }, [settings.reducedMotion, showLoading]);

  return showLoading ? <LoadingScreen /> : <HomeScreen />;
}
