import { getTierPosition } from '@zen-mahjong/game-content';

import {
  createInitialAdvertisementState,
  validateAdvertisementState,
  type AdvertisementStateV1,
} from './advertisement';
import { createConcentrationRun, type ConcentrationRunV1 } from './concentration-assists';
import { createConcentrationSession } from './concentration-engine';
import {
  validateConcentrationRun,
  validateGameState,
  validateLocalEconomyState,
} from './contracts';
import { createInitialEconomyState, type LocalEconomyStateV1 } from './local-economy';
import type { GameState } from './model';
import {
  createInitialPlayerProgression,
  validatePlayerProgression,
  type PlayerProgressionV1,
} from './score-progression';

export const OFFLINE_SAVE_SCHEMA_VERSION = 2 as const;
export const FUTURE_SYNC_OUTBOX_SCHEMA_VERSION = 1 as const;
export const FUTURE_SYNC_EVENT_SCHEMA_VERSION = 1 as const;
export const LEGACY_MIGRATION_ARCHIVE_SCHEMA_VERSION = 1 as const;

export type JsonPrimitive = boolean | null | number | string;
export type JsonValue =
  JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export type FutureSyncEventKind =
  | 'advertisement-receipt'
  | 'completion-receipt'
  | 'economy-transaction'
  | 'session-snapshot'
  | 'streak-visit'
  | 'tier-award';

export interface FutureSyncEventV1 {
  acknowledgedAt: string | null;
  aggregateId: string;
  eventId: string;
  kind: FutureSyncEventKind;
  occurredAt: string;
  payload: JsonValue;
  payloadVersion: number;
  schemaVersion: typeof FUTURE_SYNC_EVENT_SCHEMA_VERSION;
  status: 'acknowledged' | 'pending';
}

export interface FutureSyncOutboxV1 {
  events: readonly FutureSyncEventV1[];
  schemaVersion: typeof FUTURE_SYNC_OUTBOX_SCHEMA_VERSION;
}

export interface LegacyActiveSessionV1 {
  game: GameState;
  hintCount: number;
  id: string;
  startedAt: string;
}

export interface LegacyMigrationArchiveV1 {
  activeSession: JsonValue | null;
  migratedAt: string;
  playerState: JsonValue | null;
  schemaVersion: typeof LEGACY_MIGRATION_ARCHIVE_SCHEMA_VERSION;
  sourceVersion: '0.2.0';
}

export interface OfflineSaveV2 {
  activeRun: ConcentrationRunV1 | null;
  advertisements: AdvertisementStateV1;
  economy: LocalEconomyStateV1;
  legacyMigration: LegacyMigrationArchiveV1 | null;
  outbox: FutureSyncOutboxV1;
  progression: PlayerProgressionV1;
  schemaVersion: typeof OFFLINE_SAVE_SCHEMA_VERSION;
}

export interface LegacyOfflineMigrationResult {
  activeSessionMigrated: boolean;
  playerStateArchived: boolean;
  save: OfflineSaveV2;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (!isRecord(value)) return false;
  return Object.values(value).every(isJsonValue);
}

export function validateLegacyActiveSession(value: unknown): value is LegacyActiveSessionV1 {
  return (
    isRecord(value) &&
    validateGameState(value.game) &&
    isNonNegativeInteger(value.hintCount) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.startedAt)
  );
}

export function createEmptyFutureSyncOutbox(): FutureSyncOutboxV1 {
  return { events: [], schemaVersion: FUTURE_SYNC_OUTBOX_SCHEMA_VERSION };
}

export function validateFutureSyncEvent(value: unknown): value is FutureSyncEventV1 {
  if (!isRecord(value)) return false;
  return (
    value.schemaVersion === FUTURE_SYNC_EVENT_SCHEMA_VERSION &&
    (value.status === 'pending' || value.status === 'acknowledged') &&
    (value.kind === 'advertisement-receipt' ||
      value.kind === 'completion-receipt' ||
      value.kind === 'economy-transaction' ||
      value.kind === 'session-snapshot' ||
      value.kind === 'streak-visit' ||
      value.kind === 'tier-award') &&
    isNonEmptyString(value.aggregateId) &&
    isNonEmptyString(value.eventId) &&
    isNonEmptyString(value.occurredAt) &&
    Number.isInteger(value.payloadVersion) &&
    Number(value.payloadVersion) >= 1 &&
    isJsonValue(value.payload) &&
    ((value.status === 'pending' && value.acknowledgedAt === null) ||
      (value.status === 'acknowledged' && isNonEmptyString(value.acknowledgedAt)))
  );
}

export function validateFutureSyncOutbox(value: unknown): value is FutureSyncOutboxV1 {
  if (
    !isRecord(value) ||
    value.schemaVersion !== FUTURE_SYNC_OUTBOX_SCHEMA_VERSION ||
    !Array.isArray(value.events) ||
    !value.events.every(validateFutureSyncEvent)
  ) {
    return false;
  }
  return new Set(value.events.map((event) => event.eventId)).size === value.events.length;
}

export function enqueueFutureSyncEvent(
  outbox: FutureSyncOutboxV1,
  event: Omit<FutureSyncEventV1, 'acknowledgedAt' | 'schemaVersion' | 'status'>,
): FutureSyncOutboxV1 {
  if (outbox.events.some((existing) => existing.eventId === event.eventId)) return outbox;
  const nextEvent: FutureSyncEventV1 = {
    ...event,
    acknowledgedAt: null,
    schemaVersion: FUTURE_SYNC_EVENT_SCHEMA_VERSION,
    status: 'pending',
  };
  if (!validateFutureSyncEvent(nextEvent)) throw new RangeError('Invalid future-sync event');
  return { ...outbox, events: [...outbox.events, nextEvent] };
}

export function acknowledgeFutureSyncEvent(
  outbox: FutureSyncOutboxV1,
  eventId: string,
  acknowledgedAt: string,
): FutureSyncOutboxV1 {
  const event = outbox.events.find((candidate) => candidate.eventId === eventId);
  if (!event || event.status === 'acknowledged') return outbox;
  return {
    ...outbox,
    events: outbox.events.map((candidate) =>
      candidate.eventId === eventId
        ? { ...candidate, acknowledgedAt, status: 'acknowledged' as const }
        : candidate,
    ),
  };
}

export function getPendingFutureSyncEvents(
  outbox: FutureSyncOutboxV1,
): readonly FutureSyncEventV1[] {
  return outbox.events.filter((event) => event.status === 'pending');
}

export function createInitialOfflineSave(createdAt: string): OfflineSaveV2 {
  return {
    activeRun: null,
    advertisements: createInitialAdvertisementState(),
    economy: createInitialEconomyState(createdAt),
    legacyMigration: null,
    outbox: createEmptyFutureSyncOutbox(),
    progression: createInitialPlayerProgression(),
    schemaVersion: OFFLINE_SAVE_SCHEMA_VERSION,
  };
}

export function migrateLegacyActiveSession(
  legacy: LegacyActiveSessionV1,
  levelNumber = 1,
): ConcentrationRunV1 {
  const session = createConcentrationSession({
    activeSince: null,
    assistUsage: { hint: legacy.hintCount, shuffle: legacy.game.shuffleCount, undo: 0 },
    category: getTierPosition(levelNumber).category,
    game: legacy.game,
    levelContentVersion: '0.2.0-legacy',
    levelNumber,
    sessionId: legacy.id,
    startedAt: legacy.startedAt,
  });
  return createConcentrationRun(session);
}

function archiveJson(value: unknown): JsonValue | null {
  return isJsonValue(value) ? value : null;
}

export function migrateLegacyOfflineState(input: {
  activeSession: unknown;
  migratedAt: string;
  playerState: unknown;
}): LegacyOfflineMigrationResult {
  const save = createInitialOfflineSave(input.migratedAt);
  const legacyActiveSession = validateLegacyActiveSession(input.activeSession)
    ? input.activeSession
    : null;
  const activeSessionMigrated = legacyActiveSession !== null;
  const playerState = archiveJson(input.playerState);
  return {
    activeSessionMigrated,
    playerStateArchived: playerState !== null,
    save: {
      ...save,
      activeRun: legacyActiveSession ? migrateLegacyActiveSession(legacyActiveSession) : null,
      legacyMigration: {
        activeSession: archiveJson(input.activeSession),
        migratedAt: input.migratedAt,
        playerState,
        schemaVersion: LEGACY_MIGRATION_ARCHIVE_SCHEMA_VERSION,
        sourceVersion: '0.2.0',
      },
    },
  };
}

function validateLegacyMigrationArchive(value: unknown): value is LegacyMigrationArchiveV1 {
  return (
    isRecord(value) &&
    value.schemaVersion === LEGACY_MIGRATION_ARCHIVE_SCHEMA_VERSION &&
    value.sourceVersion === '0.2.0' &&
    isNonEmptyString(value.migratedAt) &&
    (value.activeSession === null || isJsonValue(value.activeSession)) &&
    (value.playerState === null || isJsonValue(value.playerState))
  );
}

export function validateOfflineSave(value: unknown): value is OfflineSaveV2 {
  if (
    !isRecord(value) ||
    value.schemaVersion !== OFFLINE_SAVE_SCHEMA_VERSION ||
    (value.activeRun !== null && !validateConcentrationRun(value.activeRun)) ||
    !validateAdvertisementState(value.advertisements) ||
    !validateLocalEconomyState(value.economy) ||
    (value.legacyMigration !== null && !validateLegacyMigrationArchive(value.legacyMigration)) ||
    !validateFutureSyncOutbox(value.outbox) ||
    !validatePlayerProgression(value.progression)
  ) {
    return false;
  }

  if (
    value.activeRun !== null &&
    value.activeRun.session.levelNumber !== value.progression.currentLevelNumber
  ) {
    return false;
  }
  const economyTransactionIds = new Set(
    value.economy.transactions.map((transaction) => transaction.transactionId),
  );
  if (
    value.advertisements.receipts.some(
      (receipt) =>
        receipt.reward.kind === 'assist' &&
        !economyTransactionIds.has(`${receipt.receiptId}:reward`),
    )
  ) {
    return false;
  }
  return (
    value.activeRun === null ||
    value.activeRun.history.every(
      (snapshot) =>
        snapshot.economyTransactionId === null ||
        economyTransactionIds.has(snapshot.economyTransactionId),
    )
  );
}
