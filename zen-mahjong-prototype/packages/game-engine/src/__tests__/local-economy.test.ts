import { grantEligibleAchievementRewards } from '../achievement-rewards';
import { validateLocalEconomyState } from '../contracts';
import {
  applyEconomyTransaction,
  createInitialEconomyState,
  ensureInitialAssistGrant,
  getEconomyBalances,
  reverseEconomyTransaction,
} from '../local-economy';

const createdAt = '2026-10-02T00:00:00.000Z';

describe('v0.3.0 local economy ledger', () => {
  it('derives the confirmed first-install inventory from append-only entries', () => {
    const state = createInitialEconomyState(createdAt);
    const ensuredAgain = ensureInitialAssistGrant(state, createdAt);

    expect(getEconomyBalances(state)).toEqual({
      concentrationScore: 0,
      hint: 6,
      shuffle: 2,
      undo: 4,
    });
    expect(state.entries).toHaveLength(3);
    expect(state.transactions).toHaveLength(1);
    expect(ensuredAgain).toBe(state);
  });

  it('applies one transaction once and rejects balances below zero', () => {
    const initial = createInitialEconomyState(createdAt);
    const first = applyEconomyTransaction(initial, {
      createdAt,
      mutations: [{ asset: 'hint', delta: -1, reason: 'assist-use' }],
      transactionId: 'use-hint-1',
    });
    const duplicate = applyEconomyTransaction(first.state, {
      createdAt,
      mutations: [{ asset: 'hint', delta: -1, reason: 'assist-use' }],
      transactionId: 'use-hint-1',
    });
    const overspend = applyEconomyTransaction(first.state, {
      createdAt,
      mutations: [{ asset: 'shuffle', delta: -3, reason: 'assist-use' }],
      transactionId: 'overspend-shuffle',
    });

    expect(first.applied).toBe(true);
    expect(getEconomyBalances(first.state).hint).toBe(5);
    expect(duplicate).toMatchObject({ applied: false, reason: 'already-applied' });
    expect(duplicate.state).toBe(first.state);
    expect(overspend).toMatchObject({ applied: false, reason: 'insufficient-balance' });
    expect(overspend.state).toBe(first.state);
  });

  it('reverses an earlier transaction by appending compensating entries', () => {
    const initial = createInitialEconomyState(createdAt);
    const spent = applyEconomyTransaction(initial, {
      createdAt,
      mutations: [{ asset: 'shuffle', delta: -1, reason: 'assist-use' }],
      transactionId: 'shuffle-1',
    });
    const reversed = reverseEconomyTransaction(spent.state, 'shuffle-1', {
      createdAt,
      transactionId: 'reverse-shuffle-1',
    });
    const duplicateReversal = reverseEconomyTransaction(reversed.state, 'shuffle-1', {
      createdAt,
      transactionId: 'reverse-shuffle-1-again',
    });

    expect(reversed.applied).toBe(true);
    expect(getEconomyBalances(reversed.state).shuffle).toBe(2);
    expect(reversed.state.entries).toHaveLength(initial.entries.length + 2);
    expect(duplicateReversal).toMatchObject({ applied: false, reason: 'already-reversed' });
  });

  it('validates a JSON-reconstructed ledger and rejects orphaned entries', () => {
    const initial = createInitialEconomyState(createdAt);
    const reconstructed: unknown = JSON.parse(JSON.stringify(initial));

    expect(validateLocalEconomyState(reconstructed)).toBe(true);
    expect(
      validateLocalEconomyState({
        ...initial,
        entries: [...initial.entries, { ...initial.entries[0], entryId: 'orphan-entry' }],
      }),
    ).toBe(false);
  });
});

describe('v0.3.0 automatic achievement rewards', () => {
  it('grants confirmed streak rewards automatically and only once', () => {
    const initial = createInitialEconomyState(createdAt);
    const first = grantEligibleAchievementRewards(initial, {
      concentrationScore: 0,
      createdAt,
      streakDays: 21,
    });
    const retry = grantEligibleAchievementRewards(first.state, {
      concentrationScore: 0,
      createdAt,
      streakDays: 21,
    });

    expect(first.grantedAchievementIds).toEqual(['streak-7', 'streak-14', 'streak-21']);
    expect(getEconomyBalances(first.state)).toMatchObject({ hint: 11, shuffle: 6, undo: 8 });
    expect(retry.grantedAchievementIds).toEqual([]);
    expect(retry.state).toBe(first.state);
  });

  it('uses the fixed input score and does not recursively chain reward score', () => {
    const initial = createInitialEconomyState(createdAt);
    const atTwentyFive = grantEligibleAchievementRewards(initial, {
      concentrationScore: 25,
      createdAt,
      streakDays: 0,
    });

    expect(atTwentyFive.grantedAchievementIds).toEqual(['concentration-25']);
    expect(getEconomyBalances(atTwentyFive.state)).toMatchObject({
      concentrationScore: 2,
      undo: 5,
    });
    expect(
      atTwentyFive.state.transactions.some(
        (transaction) => transaction.transactionId === 'achievement:concentration-50',
      ),
    ).toBe(false);
  });

  it('grants every confirmed score threshold reached by progress reconciliation', () => {
    const result = grantEligibleAchievementRewards(createInitialEconomyState(createdAt), {
      concentrationScore: 200,
      createdAt,
      streakDays: 0,
    });

    expect(result.grantedAchievementIds).toEqual([
      'concentration-25',
      'concentration-50',
      'concentration-100',
      'concentration-125',
      'concentration-150',
      'concentration-200',
    ]);
    expect(getEconomyBalances(result.state)).toMatchObject({
      concentrationScore: 42,
      undo: 25,
    });
  });
});
