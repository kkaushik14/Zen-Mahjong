import { INITIAL_ASSIST_INVENTORY } from './concentration-config';
import type {
  EconomyAsset,
  EconomyLedgerEntryV1,
  EconomyLedgerReason,
} from './concentration-model';
import { ECONOMY_LEDGER_SCHEMA_VERSION } from './concentration-model';

export const LOCAL_ECONOMY_SCHEMA_VERSION = 1 as const;
export const ECONOMY_TRANSACTION_SCHEMA_VERSION = 1 as const;

export interface EconomyBalances {
  concentrationScore: number;
  hint: number;
  shuffle: number;
  undo: number;
}

export interface EconomyMutation {
  asset: EconomyAsset;
  delta: number;
  reason: EconomyLedgerReason;
  sessionId?: string | null;
}

export interface EconomyLedgerTransactionV1 {
  createdAt: string;
  entryIds: readonly string[];
  reversesTransactionId: string | null;
  schemaVersion: typeof ECONOMY_TRANSACTION_SCHEMA_VERSION;
  transactionId: string;
}

export interface LocalEconomyStateV1 {
  entries: readonly EconomyLedgerEntryV1[];
  schemaVersion: typeof LOCAL_ECONOMY_SCHEMA_VERSION;
  transactions: readonly EconomyLedgerTransactionV1[];
}

export interface ApplyEconomyTransactionInput {
  createdAt: string;
  mutations: readonly EconomyMutation[];
  reversesTransactionId?: string | null;
  transactionId: string;
}

export interface EconomyTransactionResult {
  applied: boolean;
  reason: 'already-applied' | 'already-reversed' | 'insufficient-balance' | null;
  state: LocalEconomyStateV1;
  transaction: EconomyLedgerTransactionV1 | null;
}

const EMPTY_BALANCES: Readonly<EconomyBalances> = Object.freeze({
  concentrationScore: 0,
  hint: 0,
  shuffle: 0,
  undo: 0,
});

function balanceKey(asset: EconomyAsset): keyof EconomyBalances {
  return asset === 'concentration-score' ? 'concentrationScore' : asset;
}

function assertTransactionInput(input: ApplyEconomyTransactionInput): void {
  if (input.transactionId.trim().length === 0) {
    throw new RangeError('transactionId must not be empty');
  }
  if (input.createdAt.trim().length === 0) throw new RangeError('createdAt must not be empty');
  if (input.mutations.length === 0) throw new RangeError('mutations must not be empty');
  if (
    input.mutations.some((mutation) => !Number.isInteger(mutation.delta) || mutation.delta === 0)
  ) {
    throw new RangeError('mutation deltas must be non-zero integers');
  }
}

export function getEconomyBalances(state: LocalEconomyStateV1): EconomyBalances {
  return state.entries.reduce<EconomyBalances>(
    (balances, entry) => {
      const key = balanceKey(entry.asset);
      return { ...balances, [key]: balances[key] + entry.delta };
    },
    { ...EMPTY_BALANCES },
  );
}

export function applyEconomyTransaction(
  state: LocalEconomyStateV1,
  input: ApplyEconomyTransactionInput,
): EconomyTransactionResult {
  assertTransactionInput(input);

  const existing = state.transactions.find(
    (transaction) => transaction.transactionId === input.transactionId,
  );
  if (existing) {
    return { applied: false, reason: 'already-applied', state, transaction: existing };
  }

  const reversesTransactionId = input.reversesTransactionId ?? null;
  if (
    reversesTransactionId &&
    state.transactions.some(
      (transaction) => transaction.reversesTransactionId === reversesTransactionId,
    )
  ) {
    return { applied: false, reason: 'already-reversed', state, transaction: null };
  }

  const balances = getEconomyBalances(state);
  for (const mutation of input.mutations) {
    const key = balanceKey(mutation.asset);
    balances[key] += mutation.delta;
  }
  if (Object.values(balances).some((balance) => balance < 0)) {
    return { applied: false, reason: 'insufficient-balance', state, transaction: null };
  }

  const entries = input.mutations.map<EconomyLedgerEntryV1>((mutation, index) => ({
    asset: mutation.asset,
    createdAt: input.createdAt,
    delta: mutation.delta,
    entryId: `${input.transactionId}:entry-${index + 1}:${mutation.asset}`,
    reason: mutation.reason,
    schemaVersion: ECONOMY_LEDGER_SCHEMA_VERSION,
    sessionId: mutation.sessionId ?? null,
  }));
  const transaction: EconomyLedgerTransactionV1 = {
    createdAt: input.createdAt,
    entryIds: entries.map((entry) => entry.entryId),
    reversesTransactionId,
    schemaVersion: ECONOMY_TRANSACTION_SCHEMA_VERSION,
    transactionId: input.transactionId,
  };

  return {
    applied: true,
    reason: null,
    state: {
      ...state,
      entries: [...state.entries, ...entries],
      transactions: [...state.transactions, transaction],
    },
    transaction,
  };
}

export function reverseEconomyTransaction(
  state: LocalEconomyStateV1,
  originalTransactionId: string,
  input: Omit<ApplyEconomyTransactionInput, 'mutations' | 'reversesTransactionId'> & {
    additionalMutations?: readonly EconomyMutation[];
  },
): EconomyTransactionResult {
  const original = state.transactions.find(
    (transaction) => transaction.transactionId === originalTransactionId,
  );
  if (!original) throw new RangeError(`Unknown economy transaction: ${originalTransactionId}`);
  const entryIds = new Set(original.entryIds);
  const reversalMutations = state.entries
    .filter((entry) => entryIds.has(entry.entryId))
    .map<EconomyMutation>((entry) => ({
      asset: entry.asset,
      delta: -entry.delta,
      reason: 'adjustment',
      sessionId: entry.sessionId,
    }));

  return applyEconomyTransaction(state, {
    createdAt: input.createdAt,
    mutations: [...reversalMutations, ...(input.additionalMutations ?? [])],
    reversesTransactionId: originalTransactionId,
    transactionId: input.transactionId,
  });
}

export function createEmptyEconomyState(): LocalEconomyStateV1 {
  return {
    entries: [],
    schemaVersion: LOCAL_ECONOMY_SCHEMA_VERSION,
    transactions: [],
  };
}

export function ensureInitialAssistGrant(
  state: LocalEconomyStateV1,
  createdAt: string,
): LocalEconomyStateV1 {
  const result = applyEconomyTransaction(state, {
    createdAt,
    mutations: [
      { asset: 'shuffle', delta: INITIAL_ASSIST_INVENTORY.shuffle, reason: 'initial-grant' },
      { asset: 'undo', delta: INITIAL_ASSIST_INVENTORY.undo, reason: 'initial-grant' },
      { asset: 'hint', delta: INITIAL_ASSIST_INVENTORY.hint, reason: 'initial-grant' },
    ],
    transactionId: 'initial-assist-grant:v0.3.0',
  });
  if (!result.applied && result.reason !== 'already-applied') {
    throw new Error('Unable to ensure the initial assist grant');
  }
  return result.state;
}

export function createInitialEconomyState(createdAt: string): LocalEconomyStateV1 {
  return ensureInitialAssistGrant(createEmptyEconomyState(), createdAt);
}
