import type { ConcentrationCategory } from '@zen-mahjong/game-content';

import type { GameState, TileId } from './model';

export const CONCENTRATION_SESSION_SCHEMA_VERSION = 1 as const;
export const COMPLETION_RECEIPT_SCHEMA_VERSION = 1 as const;
export const ECONOMY_LEDGER_SCHEMA_VERSION = 1 as const;

export type AssistKind = 'shuffle' | 'undo' | 'hint';
export type EconomyAsset = AssistKind | 'concentration-score';
export type ConcentrationSessionStatus = 'active' | 'blocked' | 'won' | 'failed';

export interface AssistInventory {
  hint: number;
  shuffle: number;
  undo: number;
}

export interface AssistUsage {
  hint: number;
  shuffle: number;
  undo: number;
}

export interface ConcentrationSessionV1 {
  activeElapsedMs: number;
  activeSince: string | null;
  assistUsage: AssistUsage;
  category: ConcentrationCategory;
  game: GameState;
  levelContentVersion: string;
  levelNumber: number;
  regularTray: readonly TileId[];
  revivalCount: number;
  schemaVersion: typeof CONCENTRATION_SESSION_SCHEMA_VERSION;
  sessionId: string;
  specialSlotTileId: TileId | null;
  specialUsesRemaining: number;
  startedAt: string;
  status: ConcentrationSessionStatus;
}

export type EconomyLedgerReason =
  | 'initial-grant'
  | 'assist-use'
  | 'achievement-reward'
  | 'level-reward'
  | 'revival-spend'
  | 'advertisement-reward'
  | 'adjustment';

export interface EconomyLedgerEntryV1 {
  asset: EconomyAsset;
  createdAt: string;
  delta: number;
  entryId: string;
  reason: EconomyLedgerReason;
  schemaVersion: typeof ECONOMY_LEDGER_SCHEMA_VERSION;
  sessionId: string | null;
}

export interface CompletionReceiptV1 {
  activeDurationSeconds: number;
  assistUsage: AssistUsage;
  completedAt: string;
  levelNumber: number;
  qualifyingAssistAdCount: number;
  receiptId: string;
  schemaVersion: typeof COMPLETION_RECEIPT_SCHEMA_VERSION;
  sessionId: string;
  zenScore: number;
}
