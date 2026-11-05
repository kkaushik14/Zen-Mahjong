import {
  countQualifyingAssistAdvertisements,
  createInitialAdvertisementState,
  grantAdvertisementAssist,
  recordAdvertisementRevival,
  validateAdvertisementState,
  type AdvertisementResult,
} from '../advertisement';
import { createInitialEconomyState, getEconomyBalances } from '../local-economy';

const completed: AdvertisementResult = {
  completedAt: '2026-10-02T00:00:30.000Z',
  impressionId: 'impression-1',
  requestId: 'request-1',
  status: 'completed',
  verification: 'development',
};

describe('advertisement rewards', () => {
  it('grants one assist, one score qualification, and no duplicate reward', () => {
    const request = {
      placement: 'assist-reward' as const,
      requestId: 'request-1',
      sessionId: 'session-1',
    };
    const initialAds = createInitialAdvertisementState();
    const initialEconomy = createInitialEconomyState('2026-10-02T00:00:00.000Z');
    const first = grantAdvertisementAssist(initialAds, initialEconomy, request, completed, 'hint');
    const duplicate = grantAdvertisementAssist(
      first.advertisements,
      first.economy,
      request,
      completed,
      'hint',
    );

    expect(first.accepted).toBe(true);
    expect(getEconomyBalances(first.economy).hint).toBe(7);
    expect(countQualifyingAssistAdvertisements(first.advertisements, 'session-1')).toBe(1);
    expect(duplicate).toMatchObject({ accepted: false, reason: 'already-granted' });
    expect(getEconomyBalances(duplicate.economy).hint).toBe(7);
    expect(validateAdvertisementState(JSON.parse(JSON.stringify(first.advertisements)))).toBe(true);
  });

  it('records revival without a score qualification or economy mutation', () => {
    const initial = createInitialAdvertisementState();
    const result = recordAdvertisementRevival(
      initial,
      { placement: 'revival', requestId: 'request-1', sessionId: 'session-1' },
      completed,
    );

    expect(result.accepted).toBe(true);
    expect(result.receipt?.qualifiesForZenScore).toBe(false);
    expect(countQualifyingAssistAdvertisements(result.advertisements, 'session-1')).toBe(0);
  });

  it('does not grant cancelled or unavailable results', () => {
    const initial = createInitialAdvertisementState();
    const economy = createInitialEconomyState('2026-10-02T00:00:00.000Z');
    const result = grantAdvertisementAssist(
      initial,
      economy,
      { placement: 'assist-reward', requestId: 'request-1', sessionId: 'session-1' },
      { reason: 'cancelled', requestId: 'request-1', status: 'not-completed' },
      'undo',
    );

    expect(result).toMatchObject({ accepted: false, reason: 'invalid-result' });
    expect(result.economy).toBe(economy);
    expect(result.advertisements).toBe(initial);
  });
});
