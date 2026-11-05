import type { ConcentrationCategory } from '@zen-mahjong/game-content';

import { getIncludedSpecialUses } from './concentration-config';
import type {
  AssistUsage,
  ConcentrationSessionStatus,
  ConcentrationSessionV1,
} from './concentration-model';
import { CONCENTRATION_SESSION_SCHEMA_VERSION } from './concentration-model';
import { getRevivalCost } from './economy';
import type { AvailabilityRule, GameState, MahjongTile, TileId } from './model';
import { getTile, restartGame, standardAvailabilityRule } from './rules';

const REGULAR_TRAY_CAPACITY = 4;

export type ConcentrationCommand =
  | { tileId: TileId; type: 'select-board-tile' }
  | { trayTileId: TileId; type: 'use-special-slot' }
  | { type: 'restart' }
  | { availableConcentrationScore: number; type: 'revive' }
  | { type: 'revive-with-advertisement' };

export type ConcentrationEvent =
  | { tileId: TileId; trayIndex: number; type: 'tile-inserted' }
  | { firstTileId: TileId; secondTileId: TileId; type: 'pair-resolved' }
  | { boardTileId: TileId; trayTileId: TileId; type: 'special-pair-resolved' }
  | { remainingUses: number; type: 'special-use-consumed' }
  | { type: 'session-blocked' }
  | { type: 'session-failed' }
  | { type: 'level-won' }
  | { type: 'session-restarted' }
  | { revivalNumber: number; scoreCost: number; type: 'session-revived' };

export type ConcentrationRejectionReason =
  | 'insufficient-concentration-score'
  | 'no-special-use'
  | 'no-special-match'
  | 'session-not-active'
  | 'session-not-recoverable'
  | 'tile-not-available'
  | 'tile-not-in-tray'
  | 'tray-full';

export interface ConcentrationCommandResult {
  accepted: boolean;
  events: readonly ConcentrationEvent[];
  reason: ConcentrationRejectionReason | null;
  scoreCost: number;
  session: ConcentrationSessionV1;
}

export interface CreateConcentrationSessionInput {
  activeElapsedMs?: number;
  activeSince?: string | null;
  assistUsage?: AssistUsage;
  category: ConcentrationCategory;
  game: GameState;
  levelContentVersion: string;
  levelNumber: number;
  sessionId: string;
  startedAt: string;
}

export interface ConcentrationEngineOptions {
  isAvailable?: AvailabilityRule;
}

function accepted(
  session: ConcentrationSessionV1,
  events: readonly ConcentrationEvent[],
  scoreCost = 0,
): ConcentrationCommandResult {
  return { accepted: true, events, reason: null, scoreCost, session };
}

function rejected(
  session: ConcentrationSessionV1,
  reason: ConcentrationRejectionReason,
): ConcentrationCommandResult {
  return { accepted: false, events: [], reason, scoreCost: 0, session };
}

function updateGameTiles(game: GameState, tileIds: readonly TileId[], removed: boolean): GameState {
  const ids = new Set(tileIds);
  return {
    ...game,
    tiles: game.tiles.map((tile) => (ids.has(tile.id) ? { ...tile, removed } : tile)),
  };
}

function findSpecialTarget(
  session: ConcentrationSessionV1,
  trayTileId: TileId,
  isAvailable: AvailabilityRule,
): MahjongTile | undefined {
  const trayTile = getTile(session.game, trayTileId);
  if (!trayTile || !session.regularTray.includes(trayTileId)) return undefined;

  return session.game.tiles.find(
    (tile) =>
      !tile.removed &&
      tile.matchingGroup === trayTile.matchingGroup &&
      isAvailable(tile, session.game.tiles),
  );
}

export function canUseSpecialSlot(
  session: ConcentrationSessionV1,
  isAvailable: AvailabilityRule = standardAvailabilityRule,
): boolean {
  return (
    session.specialUsesRemaining > 0 &&
    session.regularTray.some((tileId) => findSpecialTarget(session, tileId, isAvailable))
  );
}

export function deriveConcentrationStatus(
  session: ConcentrationSessionV1,
  isAvailable: AvailabilityRule = standardAvailabilityRule,
): ConcentrationSessionStatus {
  const boardIsEmpty = session.game.tiles.every((tile) => tile.removed);
  if (boardIsEmpty && session.regularTray.length === 0) return 'won';

  if (session.regularTray.length >= REGULAR_TRAY_CAPACITY) {
    return canUseSpecialSlot(session, isAvailable) ? 'blocked' : 'failed';
  }

  const hasAvailableBoardTile = session.game.tiles.some(
    (tile) => !tile.removed && isAvailable(tile, session.game.tiles),
  );
  return hasAvailableBoardTile ? 'active' : 'failed';
}

export function createConcentrationSession(
  input: CreateConcentrationSessionInput,
  options: ConcentrationEngineOptions = {},
): ConcentrationSessionV1 {
  const session: ConcentrationSessionV1 = {
    activeElapsedMs: input.activeElapsedMs ?? 0,
    activeSince: input.activeSince === undefined ? input.startedAt : input.activeSince,
    assistUsage: input.assistUsage ?? { hint: 0, shuffle: 0, undo: 0 },
    category: input.category,
    game: input.game,
    levelContentVersion: input.levelContentVersion,
    levelNumber: input.levelNumber,
    regularTray: [],
    revivalCount: 0,
    schemaVersion: CONCENTRATION_SESSION_SCHEMA_VERSION,
    sessionId: input.sessionId,
    specialSlotTileId: null,
    specialUsesRemaining: getIncludedSpecialUses(input.category),
    startedAt: input.startedAt,
    status: 'active',
  };
  const status = deriveConcentrationStatus(session, options.isAvailable);
  return {
    ...session,
    activeSince: status === 'won' || status === 'failed' ? null : session.activeSince,
    status,
  };
}

function selectBoardTile(
  session: ConcentrationSessionV1,
  tileId: TileId,
  isAvailable: AvailabilityRule,
): ConcentrationCommandResult {
  if (session.status !== 'active') return rejected(session, 'session-not-active');
  if (session.regularTray.length >= REGULAR_TRAY_CAPACITY) {
    return rejected(session, 'tray-full');
  }

  const tile = getTile(session.game, tileId);
  if (!tile || tile.removed || !isAvailable(tile, session.game.tiles)) {
    return rejected(session, 'tile-not-available');
  }

  const matchingTrayIndex = session.regularTray.findIndex(
    (trayTileId) => getTile(session.game, trayTileId)?.matchingGroup === tile.matchingGroup,
  );
  let regularTray: readonly TileId[];
  const events: ConcentrationEvent[] = [
    { tileId, trayIndex: session.regularTray.length, type: 'tile-inserted' },
  ];

  if (matchingTrayIndex >= 0) {
    const matchingTileId = session.regularTray[matchingTrayIndex];
    if (!matchingTileId) return rejected(session, 'tile-not-in-tray');
    regularTray = session.regularTray.filter((_, index) => index !== matchingTrayIndex);
    events.push({ firstTileId: matchingTileId, secondTileId: tileId, type: 'pair-resolved' });
  } else {
    regularTray = [...session.regularTray, tileId];
  }

  const nextWithoutStatus: ConcentrationSessionV1 = {
    ...session,
    game: updateGameTiles(session.game, [tileId], true),
    regularTray,
  };
  const next = {
    ...nextWithoutStatus,
    status: deriveConcentrationStatus(nextWithoutStatus, isAvailable),
  };
  if (next.status === 'blocked') events.push({ type: 'session-blocked' });
  if (next.status === 'failed') events.push({ type: 'session-failed' });
  if (next.status === 'won') events.push({ type: 'level-won' });
  return accepted(next, events);
}

function useSpecialSlot(
  session: ConcentrationSessionV1,
  trayTileId: TileId,
  isAvailable: AvailabilityRule,
): ConcentrationCommandResult {
  if (session.status !== 'active' && session.status !== 'blocked') {
    return rejected(session, 'session-not-active');
  }
  if (!session.regularTray.includes(trayTileId)) {
    return rejected(session, 'tile-not-in-tray');
  }
  if (session.specialUsesRemaining < 1) return rejected(session, 'no-special-use');

  const boardTile = findSpecialTarget(session, trayTileId, isAvailable);
  if (!boardTile) return rejected(session, 'no-special-match');

  const regularTray = session.regularTray.filter((tileId) => tileId !== trayTileId);
  const nextWithoutStatus: ConcentrationSessionV1 = {
    ...session,
    game: updateGameTiles(session.game, [boardTile.id], true),
    regularTray,
    specialSlotTileId: null,
    specialUsesRemaining: session.specialUsesRemaining - 1,
  };
  const next = {
    ...nextWithoutStatus,
    status: deriveConcentrationStatus(nextWithoutStatus, isAvailable),
  };
  const events: ConcentrationEvent[] = [
    { boardTileId: boardTile.id, trayTileId, type: 'special-pair-resolved' },
    { remainingUses: next.specialUsesRemaining, type: 'special-use-consumed' },
  ];
  if (next.status === 'failed') events.push({ type: 'session-failed' });
  if (next.status === 'won') events.push({ type: 'level-won' });
  return accepted(next, events);
}

function restartSession(
  session: ConcentrationSessionV1,
  isAvailable: AvailabilityRule,
): ConcentrationCommandResult {
  if (session.status === 'won') return rejected(session, 'session-not-active');

  const nextWithoutStatus: ConcentrationSessionV1 = {
    ...session,
    game: restartGame(session.game),
    regularTray: [],
    revivalCount: 0,
    specialSlotTileId: null,
    specialUsesRemaining: getIncludedSpecialUses(session.category),
  };
  const next = {
    ...nextWithoutStatus,
    status: deriveConcentrationStatus(nextWithoutStatus, isAvailable),
  };
  return accepted(next, [{ type: 'session-restarted' }]);
}

function reviveSession(
  session: ConcentrationSessionV1,
  availableConcentrationScore: number,
  isAvailable: AvailabilityRule,
): ConcentrationCommandResult {
  if (
    (session.status !== 'blocked' && session.status !== 'failed') ||
    session.regularTray.length === 0
  ) {
    return rejected(session, 'session-not-recoverable');
  }
  if (!Number.isInteger(availableConcentrationScore) || availableConcentrationScore < 0) {
    return rejected(session, 'insufficient-concentration-score');
  }

  const revivalNumber = session.revivalCount + 1;
  const scoreCost = getRevivalCost(revivalNumber);
  if (availableConcentrationScore < scoreCost) {
    return rejected(session, 'insufficient-concentration-score');
  }

  const nextWithoutStatus: ConcentrationSessionV1 = {
    ...session,
    game: updateGameTiles(session.game, session.regularTray, false),
    regularTray: [],
    revivalCount: revivalNumber,
    specialSlotTileId: null,
  };
  const next = {
    ...nextWithoutStatus,
    status: deriveConcentrationStatus(nextWithoutStatus, isAvailable),
  };
  return accepted(next, [{ revivalNumber, scoreCost, type: 'session-revived' }], scoreCost);
}

function reviveSessionWithAdvertisement(
  session: ConcentrationSessionV1,
  isAvailable: AvailabilityRule,
): ConcentrationCommandResult {
  const revived = reviveSession(session, Number.MAX_SAFE_INTEGER, isAvailable);
  if (!revived.accepted) return revived;
  return {
    ...revived,
    events: revived.events.map((event) =>
      event.type === 'session-revived' ? { ...event, scoreCost: 0 } : event,
    ),
    scoreCost: 0,
  };
}

export function executeConcentrationCommand(
  session: ConcentrationSessionV1,
  command: ConcentrationCommand,
  options: ConcentrationEngineOptions = {},
): ConcentrationCommandResult {
  const isAvailable = options.isAvailable ?? standardAvailabilityRule;
  switch (command.type) {
    case 'select-board-tile':
      return selectBoardTile(session, command.tileId, isAvailable);
    case 'use-special-slot':
      return useSpecialSlot(session, command.trayTileId, isAvailable);
    case 'restart':
      return restartSession(session, isAvailable);
    case 'revive':
      return reviveSession(session, command.availableConcentrationScore, isAvailable);
    case 'revive-with-advertisement':
      return reviveSessionWithAdvertisement(session, isAvailable);
  }
}
