import { MemoryKeyValueStore } from '@zen-mahjong/persistence';

import { createAppRepositories } from '../repositories';

jest.mock('react-native-mmkv', () => ({ createMMKV: jest.fn() }));

const NOW = '2026-10-07T00:00:00.000Z';

describe('settings repository', () => {
  it('migrates the schema-two classic appearance to ivory marble', () => {
    const store = new MemoryKeyValueStore();
    store.setString(
      'settings',
      JSON.stringify({
        payload: {
          ambienceEnabled: true,
          hapticsEnabled: true,
          musicEnabled: true,
          reducedMotion: true,
          soundEffectsEnabled: true,
          tileStyle: 'classic',
        },
        revision: 4,
        schemaVersion: 2,
        updatedAt: NOW,
      }),
    );

    const result = createAppRepositories(store, () => new Date(NOW)).settings.read();

    expect(result.document).toMatchObject({
      payload: { reducedMotion: true, tileStyle: 'ivory-marble' },
      revision: 5,
      schemaVersion: 3,
    });
  });
});
