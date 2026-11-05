import { DeterministicFakeAdvertisementProvider } from '../advertisement-provider';

const request = {
  placement: 'assist-reward' as const,
  requestId: 'request-1',
  sessionId: 'session-1',
};

describe('deterministic fake advertisement provider', () => {
  it('returns a reproducible completed development result', async () => {
    const provider = new DeterministicFakeAdvertisementProvider({
      now: () => new Date('2026-10-02T00:00:00.000Z'),
    });

    await expect(provider.getAvailability('assist-reward')).resolves.toEqual({
      available: true,
      reason: 'available',
    });
    await expect(provider.showRewarded(request)).resolves.toEqual({
      completedAt: '2026-10-02T00:00:00.000Z',
      impressionId: 'fake:assist-reward:request-1',
      requestId: 'request-1',
      status: 'completed',
      verification: 'development',
    });
  });

  it('cycles through configured cancellation, failure, and completion results', async () => {
    const provider = new DeterministicFakeAdvertisementProvider({
      outcomes: ['cancelled', 'failed', 'completed'],
    });

    await expect(provider.showRewarded(request)).resolves.toMatchObject({
      reason: 'cancelled',
      status: 'not-completed',
    });
    await expect(
      provider.showRewarded({ ...request, requestId: 'request-2' }),
    ).resolves.toMatchObject({
      reason: 'provider-error',
      status: 'not-completed',
    });
    await expect(
      provider.showRewarded({ ...request, requestId: 'request-3' }),
    ).resolves.toMatchObject({
      status: 'completed',
    });
  });

  it('reports unavailable without producing an impression', async () => {
    const provider = new DeterministicFakeAdvertisementProvider({ available: false });

    await expect(provider.getAvailability('revival')).resolves.toEqual({
      available: false,
      reason: 'provider-unavailable',
    });
    await expect(provider.showRewarded({ ...request, placement: 'revival' })).resolves.toEqual({
      reason: 'provider-unavailable',
      requestId: 'request-1',
      status: 'not-completed',
    });
  });
});
