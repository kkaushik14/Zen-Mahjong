export type AppEnvironment = 'development' | 'preview' | 'production';

export interface VersionedDocument<T> {
  schemaVersion: number;
  revision: number;
  updatedAt: string;
  payload: T;
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  createdAt: string;
}

export interface PlayerSettings {
  ambienceEnabled: boolean;
  hapticsEnabled: boolean;
  musicEnabled: boolean;
  reducedMotion: boolean;
  soundEffectsEnabled: boolean;
  tileStyle: 'ivory-marble';
}
