import type {
  AdvertisementAvailability,
  AdvertisementPlacement,
  AdvertisementProvider,
  AdvertisementRequest,
  AdvertisementResult,
} from '@zen-mahjong/game-engine';

export type FakeAdvertisementOutcome = 'cancelled' | 'completed' | 'failed';

export interface DeterministicFakeAdvertisementProviderOptions {
  available?: boolean;
  outcomes?: readonly FakeAdvertisementOutcome[];
  now?: () => Date;
}

export class DeterministicFakeAdvertisementProvider implements AdvertisementProvider {
  private requestIndex = 0;
  private readonly available: boolean;
  private readonly now: () => Date;
  private readonly outcomes: readonly FakeAdvertisementOutcome[];

  constructor(options: DeterministicFakeAdvertisementProviderOptions = {}) {
    this.available = options.available ?? true;
    this.now = options.now ?? (() => new Date());
    this.outcomes = options.outcomes ?? ['completed'];
  }

  async getAvailability(_placement: AdvertisementPlacement): Promise<AdvertisementAvailability> {
    return this.available
      ? { available: true, reason: 'available' }
      : { available: false, reason: 'provider-unavailable' };
  }

  async showRewarded(request: AdvertisementRequest): Promise<AdvertisementResult> {
    if (!this.available) {
      return {
        reason: 'provider-unavailable',
        requestId: request.requestId,
        status: 'not-completed',
      };
    }

    const index = this.requestIndex;
    this.requestIndex += 1;
    const outcome = this.outcomes[index % this.outcomes.length] ?? 'completed';
    if (outcome !== 'completed') {
      return {
        reason: outcome === 'cancelled' ? 'cancelled' : 'provider-error',
        requestId: request.requestId,
        status: 'not-completed',
      };
    }
    return {
      completedAt: this.now().toISOString(),
      impressionId: `fake:${request.placement}:${request.requestId}`,
      requestId: request.requestId,
      status: 'completed',
      verification: 'development',
    };
  }
}

export const advertisementProvider: AdvertisementProvider =
  new DeterministicFakeAdvertisementProvider();
