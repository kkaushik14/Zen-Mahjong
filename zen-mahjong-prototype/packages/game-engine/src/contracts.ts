import {
  CONCENTRATION_RUN_SCHEMA_VERSION,
  type ConcentrationRunV1,
  type ConcentrationTransactionSnapshotV1,
} from './concentration-assists';
import {
  COMPLETION_RECEIPT_SCHEMA_VERSION,
  CONCENTRATION_SESSION_SCHEMA_VERSION,
  ECONOMY_LEDGER_SCHEMA_VERSION,
  type AssistUsage,
  type CompletionReceiptV1,
  type ConcentrationSessionV1,
  type EconomyLedgerEntryV1,
} from './concentration-model';
import type { GameState, MahjongTile } from './model';
import {
  ECONOMY_TRANSACTION_SCHEMA_VERSION,
  LOCAL_ECONOMY_SCHEMA_VERSION,
  getEconomyBalances,
  type EconomyLedgerTransactionV1,
  type LocalEconomyStateV1,
} from './local-economy';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isAssistUsage(value: unknown): value is AssistUsage {
  return (
    isRecord(value) &&
    isNonNegativeInteger(value.hint) &&
    isNonNegativeInteger(value.shuffle) &&
    isNonNegativeInteger(value.undo)
  );
}

function isTile(value: unknown): value is MahjongTile {
  if (!isRecord(value) || !isRecord(value.position)) return false;
  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.matchingGroup) &&
    isNonEmptyString(value.motif) &&
    typeof value.removed === 'boolean' &&
    Number.isFinite(value.position.column) &&
    Number.isFinite(value.position.layer) &&
    Number.isFinite(value.position.row)
  );
}

export function validateGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false;
  if (
    !isNonEmptyString(value.levelId) ||
    !isNonEmptyString(value.seed) ||
    !Array.isArray(value.tiles) ||
    !value.tiles.every(isTile) ||
    !Array.isArray(value.initialTiles) ||
    !value.initialTiles.every(isTile) ||
    !Array.isArray(value.history) ||
    !isNonNegativeInteger(value.shuffleCount)
  ) {
    return false;
  }

  const tileIds = value.tiles.map((tile) => tile.id);
  const initialTileIds = value.initialTiles.map((tile) => tile.id);
  return (
    new Set(tileIds).size === tileIds.length &&
    new Set(initialTileIds).size === initialTileIds.length &&
    [...tileIds].sort().join('|') === [...initialTileIds].sort().join('|') &&
    value.history.every(
      (move) =>
        isRecord(move) &&
        isNonEmptyString(move.firstTileId) &&
        isNonEmptyString(move.secondTileId) &&
        Number.isInteger(move.moveNumber) &&
        Number(move.moveNumber) >= 1,
    )
  );
}

export function validateEconomyLedgerEntry(value: unknown): value is EconomyLedgerEntryV1 {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === ECONOMY_LEDGER_SCHEMA_VERSION &&
    (value.asset === 'shuffle' ||
      value.asset === 'undo' ||
      value.asset === 'hint' ||
      value.asset === 'concentration-score') &&
    isNonEmptyString(value.createdAt) &&
    Number.isInteger(value.delta) &&
    Number(value.delta) !== 0 &&
    isNonEmptyString(value.entryId) &&
    (value.reason === 'initial-grant' ||
      value.reason === 'assist-use' ||
      value.reason === 'achievement-reward' ||
      value.reason === 'level-reward' ||
      value.reason === 'revival-spend' ||
      value.reason === 'advertisement-reward' ||
      value.reason === 'adjustment') &&
    (value.sessionId === null || isNonEmptyString(value.sessionId))
  );
}

function isEconomyTransaction(value: unknown): value is EconomyLedgerTransactionV1 {
  return (
    isRecord(value) &&
    value.schemaVersion === ECONOMY_TRANSACTION_SCHEMA_VERSION &&
    isNonEmptyString(value.createdAt) &&
    Array.isArray(value.entryIds) &&
    value.entryIds.length > 0 &&
    value.entryIds.every(isNonEmptyString) &&
    new Set(value.entryIds).size === value.entryIds.length &&
    (value.reversesTransactionId === null || isNonEmptyString(value.reversesTransactionId)) &&
    isNonEmptyString(value.transactionId)
  );
}

export function validateLocalEconomyState(value: unknown): value is LocalEconomyStateV1 {
  if (
    !isRecord(value) ||
    value.schemaVersion !== LOCAL_ECONOMY_SCHEMA_VERSION ||
    !Array.isArray(value.entries) ||
    !value.entries.every(validateEconomyLedgerEntry) ||
    !Array.isArray(value.transactions) ||
    !value.transactions.every(isEconomyTransaction)
  ) {
    return false;
  }

  const state = value as unknown as LocalEconomyStateV1;
  const entryIds = state.entries.map((entry) => entry.entryId);
  const transactionIds = state.transactions.map((transaction) => transaction.transactionId);
  const referencedEntryIds = state.transactions.flatMap((transaction) => transaction.entryIds);
  if (
    new Set(entryIds).size !== entryIds.length ||
    new Set(transactionIds).size !== transactionIds.length ||
    new Set(referencedEntryIds).size !== referencedEntryIds.length ||
    [...entryIds].sort().join('|') !== [...referencedEntryIds].sort().join('|')
  ) {
    return false;
  }

  const seenTransactions = new Set<string>();
  const reversedTransactions = new Set<string>();
  for (const transaction of state.transactions) {
    if (transaction.reversesTransactionId) {
      if (
        !seenTransactions.has(transaction.reversesTransactionId) ||
        reversedTransactions.has(transaction.reversesTransactionId)
      ) {
        return false;
      }
      reversedTransactions.add(transaction.reversesTransactionId);
    }
    seenTransactions.add(transaction.transactionId);
  }

  return Object.values(getEconomyBalances(state)).every((balance) => balance >= 0);
}

export function validateCompletionReceipt(value: unknown): value is CompletionReceiptV1 {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === COMPLETION_RECEIPT_SCHEMA_VERSION &&
    isNonNegativeInteger(value.activeDurationSeconds) &&
    isAssistUsage(value.assistUsage) &&
    isNonEmptyString(value.completedAt) &&
    Number.isInteger(value.levelNumber) &&
    Number(value.levelNumber) >= 1 &&
    isNonNegativeInteger(value.qualifyingAssistAdCount) &&
    isNonEmptyString(value.receiptId) &&
    isNonEmptyString(value.sessionId) &&
    isNonNegativeInteger(value.zenScore)
  );
}

export function validateConcentrationSession(value: unknown): value is ConcentrationSessionV1 {
  if (!isRecord(value)) return false;
  if (
    value.schemaVersion === CONCENTRATION_SESSION_SCHEMA_VERSION &&
    isNonNegativeInteger(value.activeElapsedMs) &&
    (value.activeSince === null || isNonEmptyString(value.activeSince)) &&
    isAssistUsage(value.assistUsage) &&
    (value.category === 'normal' ||
      value.category === 'high' ||
      value.category === 'super' ||
      value.category === 'special') &&
    validateGameState(value.game) &&
    isNonEmptyString(value.levelContentVersion) &&
    Number.isInteger(value.levelNumber) &&
    Number(value.levelNumber) >= 1 &&
    Array.isArray(value.regularTray) &&
    value.regularTray.length <= 4 &&
    value.regularTray.every(isNonEmptyString) &&
    new Set(value.regularTray).size === value.regularTray.length &&
    isNonNegativeInteger(value.revivalCount) &&
    isNonEmptyString(value.sessionId) &&
    (value.specialSlotTileId === null || isNonEmptyString(value.specialSlotTileId)) &&
    isNonNegativeInteger(value.specialUsesRemaining) &&
    isNonEmptyString(value.startedAt) &&
    (value.status === 'active' ||
      value.status === 'blocked' ||
      value.status === 'won' ||
      value.status === 'failed')
  ) {
    const tilesById = new Map(value.game.tiles.map((tile) => [tile.id, tile]));
    const trayTiles = value.regularTray.map((tileId) => tilesById.get(tileId));
    return (
      trayTiles.every((tile) => tile?.removed === true) &&
      new Set(trayTiles.map((tile) => tile?.matchingGroup)).size === trayTiles.length &&
      (value.specialSlotTileId === null || tilesById.has(value.specialSlotTileId))
    );
  }
  return false;
}

function validateConcentrationSnapshot(
  value: unknown,
): value is ConcentrationTransactionSnapshotV1 {
  if (!isRecord(value)) return false;
  return (
    validateConcentrationSession(value.afterSession) &&
    validateConcentrationSession(value.beforeSession) &&
    (value.commandType === 'select-board-tile' ||
      value.commandType === 'use-special-slot' ||
      value.commandType === 'restart' ||
      value.commandType === 'revive' ||
      value.commandType === 'revive-with-advertisement' ||
      value.commandType === 'shuffle') &&
    (value.economyTransactionId === null || isNonEmptyString(value.economyTransactionId)) &&
    isNonEmptyString(value.transactionId)
  );
}

export function validateConcentrationRun(value: unknown): value is ConcentrationRunV1 {
  if (
    !isRecord(value) ||
    value.schemaVersion !== CONCENTRATION_RUN_SCHEMA_VERSION ||
    !validateConcentrationSession(value.session) ||
    !Array.isArray(value.history) ||
    !value.history.every(validateConcentrationSnapshot) ||
    !Array.isArray(value.processedTransactionIds) ||
    !value.processedTransactionIds.every(isNonEmptyString)
  ) {
    return false;
  }

  const run = value as unknown as ConcentrationRunV1;
  const transactionIds = run.history.map((snapshot) => snapshot.transactionId);
  const processedIds = run.processedTransactionIds;
  return (
    new Set(transactionIds).size === transactionIds.length &&
    new Set(processedIds).size === processedIds.length &&
    transactionIds.every((transactionId) => processedIds.includes(transactionId)) &&
    run.history.every((snapshot) => snapshot.beforeSession.sessionId === run.session.sessionId) &&
    run.history.every((snapshot) => snapshot.afterSession.sessionId === run.session.sessionId)
  );
}
