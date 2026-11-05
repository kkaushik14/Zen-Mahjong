import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { InriaSerif_400Regular } from '@expo-google-fonts/inria-serif/400Regular';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { IrishGrover_400Regular } from '@expo-google-fonts/irish-grover/400Regular';
import { fontFamily } from '@zen-mahjong/design-tokens';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

import { preloadCriticalRuntimeAssets } from './runtime-assets';

const appFontMap = {
  [fontFamily.display]: CormorantGaramond_500Medium,
  [fontFamily.body]: Inter_400Regular,
  [fontFamily.editorial]: InriaSerif_400Regular,
  [fontFamily.accent]: IrishGrover_400Regular,
};

export function useAppResources() {
  const [fontsLoaded, fontError] = useFonts(appFontMap);
  const [artworkSettled, setArtworkSettled] = useState(false);

  useEffect(() => {
    let active = true;

    preloadCriticalRuntimeAssets()
      .catch((error: unknown) => {
        console.warn('Critical artwork preload failed; screens will load assets on demand.', error);
      })
      .finally(() => {
        if (active) setArtworkSettled(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (fontError) {
      console.warn('Bundled fonts failed to load; platform fallbacks will be used.', fontError);
    }
  }, [fontError]);

  return {
    error: fontError,
    ready: Boolean((fontsLoaded || fontError) && artworkSettled),
  };
}
