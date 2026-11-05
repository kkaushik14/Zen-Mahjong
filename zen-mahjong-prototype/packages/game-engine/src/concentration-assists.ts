import { shuffleSeeded } from '@zen-mahjong/game-content';

import {
  deriveConcentrationStatus,
  executeConcentrationCommand,
  type ConcentrationCommand,
  type ConcentrationCommandResult,
} from './concentration-engine';
import type { AssistUsage, ConcentrationSessionV1 } from './concentration-model';
import {
  applyEconomyTransaction,
  getEconomyBalances,
  reverseEconomyTransaction,
  type LocalEconomyStateV1,
} from './local-economy';
import type { MahjongTile, TileId, TilePosition } from './model';
import { findLegalPairs, getTile, standardAvailabilityRule } from './rules';

export const CONCENTRATION_RUN_SCHEMA_VERSION = 1 as const;

export interface ConcentrationTransactionSnapshotV1 {
  afterSession: ConcentrationSessionV1;
  beforeSession: ConcentrationSessionV1;
  commandType: ConcentrationCommand['type'] | 'shuffle';
  economyTransactionId: string | null;
  transactionId: string;
}

export interface ConcentrationRunV1 {
  history: readonly ConcentrationTransactionSnapshotV1[];
  processedTransactionIds: readonly string[];
  schemaVersion: typeof CONCENTRATION_RUN_SCHEMA_VERSION;
  session: ConcentrationSessionV1;
}

export interface AssistOperationInput {
  createdAt: string;
  transactionId: string;
}

export type AssistOperationRejection =
  | 'duplicate-transaction'
  | 'insufficient-hint'
  | 'insufficient-shuffle'
  | 'insufficient-undo'
  | 'no-hint-available'
  | 'no-undo-target'
  | 'session-complete'
  | 'shuffle-not-solvable';

export interface TrackedCommandResult {
  accepted: boolean;
  commandResult: ConcentrationCommandResult | null;
  economy: LocalEconomyStateV1;
  reason: AssistOperationRejection | ConcentrationCommandResult['reason'];
  run: ConcentrationRunV1;
}

export interface ConcentrationHint {
  command: Extract<ConcentrationCommand, { type: 'select-board-tile' | 'use-special-slot' }>;
  followUpTileId: TileId | null;
}

export interface HintResult {
  accepted: boolean;
  economy: LocalEconomyStateV1;
  hint: ConcentrationHint | null;
  reason: AssistOperationRejection | null;
  run: ConcentrationRunV1;
}

export interface ShuffleResult {
  accepted: boolean;
  economy: LocalEconomyStateV1;
  reason: AssistOperationRejection | null;
  run: ConcentrationRunV1;
  solutionCommands: readonly ConcentrationCommand[];
}

export interface UndoResult {
  accepted: boolean;
  economy: LocalEconomyStateV1;
  reason: AssistOperationRejection | null;
  run: ConcentrationRunV1;
}

function hasProcessed(run: ConcentrationRunV1, transactionId: string): boolean {
  return run.processedTransactionIds.includes(transactionId);
}

function withProcessed(run: ConcentrationRunV1, transactionId: string): ConcentrationRunV1 {
  return {
    ...run,
    processedTransactionIds: [...run.processedTransactionIds, transactionId],
  };
}

export function createConcentrationRun(session: ConcentrationSessionV1): ConcentrationRunV1 {
  return {
    history: [],
    processedTransactionIds: [],
    schemaVersion: CONCENTRATION_RUN_SCHEMA_VERSION,
    session,
  };
}

function findAvailableMatch(
  session: ConcentrationSessionV1,
  trayTileId: TileId,
): MahjongTile | undefined {
  const trayTile = getTile(session.game, trayTileId);
  if (!trayTile) return undefined;
  return session.game.tiles.find(
    (tile) =>
      !tile.removed &&
      tile.matchingGroup === trayTile.matchingGroup &&
      standardAvailabilityRule(tile, session.game.tiles),
  );
}

export function getConcentrationHint(session: ConcentrationSessionV1): ConcentrationHint | null {
  if (session.status === 'won' || session.status === 'failed') return null;

  for (const trayTileId of session.regularTray) {
    const target = findAvailableMatch(session, trayTileId);
    if (!target) continue;
    if (session.regularTray.length >= 4) {
      if (session.specialUsesRemaining < 1) return null;
      return {
        command: { trayTileId, type: 'use-special-slot' },
        followUpTileId: null,
      };
    }
    return {
      command: { tileId: target.id, type: 'select-board-tile' },
      followUpTileId: null,
    };
  }

  const pair = findLegalPairs(session.game)[0];
  return pair
    ? {
        command: { tileId: pair.firstTileId, type: 'select-board-tile' },
        followUpTileId: pair.secondTileId,
      }
    : null;
}

export function useHint(
  run: ConcentrationRunV1,
  economy: LocalEconomyStateV1,
  input: AssistOperationInput,
): HintResult {
  if (hasProcessed(run, input.transactionId)) {
    return { accepted: false, economy, hint: null, reason: 'duplicate-transaction', run };
  }
  if (getEconomyBalances(economy).hint < 1) {
    return { accepted: false, economy, hint: null, reason: 'insufficient-hint', run };
  }

  const hint = getConcentrationHint(run.session);
  if (!hint) return { accepted: false, economy, hint: null, reason: 'no-hint-available', run };

  const economyResult = applyEconomyTransaction(economy, {
    createdAt: input.createdAt,
    mutations: [
      {
        asset: 'hint',
        delta: -1,
        reason: 'assist-use',
        sessionId: run.session.sessionId,
      },
    ],
    transactionId: `${input.transactionId}:economy`,
  });
  if (!economyResult.applied) {
    return { accepted: false, economy, hint: null, reason: 'insufficient-hint', run };
  }

  const session = {
    ...run.session,
    assistUsage: { ...run.session.assistUsage, hint: run.session.assistUsage.hint + 1 },
  };
  return {
    accepted: true,
    economy: economyResult.state,
    hint,
    reason: null,
    run: withProcessed({ ...run, session }, input.transactionId),
  };
}

function positionRemovalOrder(
  tiles: readonly MahjongTile[],
  seed: string,
): readonly TilePosition[] | null {
  let simulated = tiles.map((tile) => ({
    ...tile,
    position: { ...tile.position },
    removed: false,
  }));
  const positions: TilePosition[] = [];

  for (let step = 0; step < tiles.length; step += 1) {
    const available = simulated.filter(
      (tile) => !tile.removed && standardAvailabilityRule(tile, simulated),
    );
    const selected = shuffleSeeded(available, `${seed}:position-${step}`)[0];
    if (!selected) return null;
    positions.push({ ...selected.position });
    simulated = simulated.map((tile) =>
      tile.id === selected.id ? { ...tile, removed: true } : tile,
    );
  }
  return positions;
}

function orderedTilesForSolution(
  session: ConcentrationSessionV1,
  activeTiles: readonly MahjongTile[],
  seed: string,
): readonly MahjongTile[] | null {
  const remainingByIdentity = new Map<string, MahjongTile[]>();
  for (const tile of activeTiles) {
    const values = remainingByIdentity.get(tile.matchingGroup) ?? [];
    values.push(tile);
    remainingByIdentity.set(tile.matchingGroup, values);
  }
  for (const [identity, values] of remainingByIdentity) {
    remainingByIdentity.set(identity, shuffleSeeded(values, `${seed}:identity:${identity}`));
  }

  const ordered: MahjongTile[] = [];
  for (const trayTileId of session.regularTray) {
    const trayTile = getTile(session.game, trayTileId);
    if (!trayTile) return null;
    const values = remainingByIdentity.get(trayTile.matchingGroup);
    const target = values?.shift();
    if (!target) return null;
    ordered.push(target);
  }

  const pairs: MahjongTile[][] = [];
  for (const [identity, values] of remainingByIdentity) {
    if (values.length % 2 !== 0) return null;
    for (let index = 0; index < values.length; index += 2) {
      const first = values[index];
      const second = values[index + 1];
      if (!first || !second) return null;
      pairs.push([first, second]);
    }
    remainingByIdentity.set(identity, []);
  }

  return [...ordered, ...shuffleSeeded(pairs, `${seed}:pair-order`).flatMap((pair) => pair)];
}

function validateShuffleSolution(
  session: ConcentrationSessionV1,
  orderedTiles: readonly MahjongTile[],
): readonly ConcentrationCommand[] | null {
  let current = session;
  const commands: ConcentrationCommand[] = [];
  const trayTargets = orderedTiles.slice(0, current.regularTray.length);
  for (let index = 0; index < trayTargets.length; index += 1) {
    const target = trayTargets[index];
    const trayTileId = current.regularTray[0];
    if (!target || !trayTileId) return null;
    const command: ConcentrationCommand =
      current.regularTray.length >= 4
        ? { trayTileId, type: 'use-special-slot' }
        : { tileId: target.id, type: 'select-board-tile' };
    const result = executeConcentrationCommand(current, command);
    if (!result.accepted) return null;
    commands.push(command);
    current = result.session;
  }

  const pairedTiles = orderedTiles.slice(trayTargets.length);
  for (let index = 0; index < pairedTiles.length; index += 2) {
    const firstTile = pairedTiles[index];
    const secondTile = pairedTiles[index + 1];
    if (!firstTile || !secondTile) return null;
    const first: ConcentrationCommand = {
      tileId: firstTile.id,
      type: 'select-board-tile',
    };
    const firstResult = executeConcentrationCommand(current, first);
    if (!firstResult.accepted) return null;
    const second: ConcentrationCommand = {
      tileId: secondTile.id,
      type: 'select-board-tile',
    };
    const secondResult = executeConcentrationCommand(firstResult.session, second);
    if (!secondResult.accepted) return null;
    commands.push(first, second);
    current = secondResult.session;
  }

  return current.status === 'won' ? commands : null;
}

function createSolvableShuffle(
  session: ConcentrationSessionV1,
): { session: ConcentrationSessionV1; solutionCommands: readonly ConcentrationCommand[] } | null {
  if (session.status === 'won') return null;
  const activeTiles = session.game.tiles.filter((tile) => !tile.removed);
  if (activeTiles.length === 0) return null;

  const seed = `${session.game.seed}:shuffle:${session.game.shuffleCount + 1}`;
  const positions = positionRemovalOrder(activeTiles, seed);
  const orderedTiles = orderedTilesForSolution(session, activeTiles, seed);
  if (!positions || !orderedTiles || positions.length !== orderedTiles.length) return null;

  const positionByTileId = new Map(
    orderedTiles.map((tile, index) => [tile.id, positions[index]] as const),
  );
  if ([...positionByTileId.values()].some((position) => !position)) return null;

  const game = {
    ...session.game,
    shuffleCount: session.game.shuffleCount + 1,
    tiles: session.game.tiles.map((tile) => {
      const position = positionByTileId.get(tile.id);
      return position ? { ...tile, position } : tile;
    }),
  };
  const shuffledWithoutStatus: ConcentrationSessionV1 = { ...session, game };
  const shuffled = {
    ...shuffledWithoutStatus,
    status: deriveConcentrationStatus(shuffledWithoutStatus),
  };
  const solutionCommands = validateShuffleSolution(shuffled, orderedTiles);
  return solutionCommands ? { session: shuffled, solutionCommands } : null;
}

function recordTransaction(
  run: ConcentrationRunV1,
  afterSession: ConcentrationSessionV1,
  transactionId: string,
  commandType: ConcentrationTransactionSnapshotV1['commandType'],
  economyTransactionId: string | null,
): ConcentrationRunV1 {
  const snapshot: ConcentrationTransactionSnapshotV1 = {
    afterSession,
    beforeSession: run.session,
    commandType,
    economyTransactionId,
    transactionId,
  };
  return withProcessed(
    { ...run, history: [...run.history, snapshot], session: afterSession },
    transactionId,
  );
}

export function executeTrackedConcentrationCommand(
  run: ConcentrationRunV1,
  economy: LocalEconomyStateV1,
  command: ConcentrationCommand,
  input: AssistOperationInput,
): TrackedCommandResult {
  if (hasProcessed(run, input.transactionId)) {
    return {
      accepted: false,
      commandResult: null,
      economy,
      reason: 'duplicate-transaction',
      run,
    };
  }

  const normalizedCommand =
    command.type === 'revive'
      ? { ...command, availableConcentrationScore: getEconomyBalances(economy).concentrationScore }
      : command;
  const commandResult = executeConcentrationCommand(run.session, normalizedCommand);
  if (!commandResult.accepted) {
    return {
      accepted: false,
      commandResult,
      economy,
      reason: commandResult.reason,
      run,
    };
  }

  let nextEconomy = economy;
  let economyTransactionId: string | null = null;
  if (commandResult.scoreCost > 0) {
    economyTransactionId = `${input.transactionId}:economy`;
    const economyResult = applyEconomyTransaction(economy, {
      createdAt: input.createdAt,
      mutations: [
        {
          asset: 'concentration-score',
          delta: -commandResult.scoreCost,
          reason: 'revival-spend',
          sessionId: run.session.sessionId,
        },
      ],
      transactionId: economyTransactionId,
    });
    if (!economyResult.applied) {
      return {
        accepted: false,
        commandResult: null,
        economy,
        reason: 'insufficient-concentration-score',
        run,
      };
    }
    nextEconomy = economyResult.state;
  }

  return {
    accepted: true,
    commandResult,
    economy: nextEconomy,
    reason: null,
    run: recordTransaction(
      run,
      commandResult.session,
      input.transactionId,
      command.type,
      economyTransactionId,
    ),
  };
}

export function useShuffle(
  run: ConcentrationRunV1,
  economy: LocalEconomyStateV1,
  input: AssistOperationInput,
): ShuffleResult {
  if (hasProcessed(run, input.transactionId)) {
    return {
      accepted: false,
      economy,
      reason: 'duplicate-transaction',
      run,
      solutionCommands: [],
    };
  }
  if (getEconomyBalances(economy).shuffle < 1) {
    return {
      accepted: false,
      economy,
      reason: 'insufficient-shuffle',
      run,
      solutionCommands: [],
    };
  }

  const shuffled = createSolvableShuffle(run.session);
  if (!shuffled) {
    return {
      accepted: false,
      economy,
      reason: run.session.status === 'won' ? 'session-complete' : 'shuffle-not-solvable',
      run,
      solutionCommands: [],
    };
  }

  const economyTransactionId = `${input.transactionId}:economy`;
  const economyResult = applyEconomyTransaction(economy, {
    createdAt: input.createdAt,
    mutations: [
      {
        asset: 'shuffle',
        delta: -1,
        reason: 'assist-use',
        sessionId: run.session.sessionId,
      },
    ],
    transactionId: economyTransactionId,
  });
  if (!economyResult.applied) {
    return {
      accepted: false,
      economy,
      reason: 'insufficient-shuffle',
      run,
      solutionCommands: [],
    };
  }

  const session = {
    ...shuffled.session,
    assistUsage: { ...shuffled.session.assistUsage, shuffle: run.session.assistUsage.shuffle + 1 },
  };
  return {
    accepted: true,
    economy: economyResult.state,
    reason: null,
    run: recordTransaction(run, session, input.transactionId, 'shuffle', economyTransactionId),
    solutionCommands: shuffled.solutionCommands,
  };
}

function restoreAssistUsage(
  current: AssistUsage,
  snapshot: ConcentrationTransactionSnapshotV1,
): AssistUsage {
  const originalDelta = {
    hint: snapshot.afterSession.assistUsage.hint - snapshot.beforeSession.assistUsage.hint,
    shuffle: snapshot.afterSession.assistUsage.shuffle - snapshot.beforeSession.assistUsage.shuffle,
    undo: snapshot.afterSession.assistUsage.undo - snapshot.beforeSession.assistUsage.undo,
  };
  return {
    hint: Math.max(0, current.hint - originalDelta.hint),
    shuffle: Math.max(0, current.shuffle - originalDelta.shuffle),
    undo: Math.max(0, current.undo - originalDelta.undo) + 1,
  };
}

export function useUndo(
  run: ConcentrationRunV1,
  economy: LocalEconomyStateV1,
  input: AssistOperationInput,
): UndoResult {
  if (hasProcessed(run, input.transactionId)) {
    return { accepted: false, economy, reason: 'duplicate-transaction', run };
  }
  if (getEconomyBalances(economy).undo < 1) {
    return { accepted: false, economy, reason: 'insufficient-undo', run };
  }

  const snapshot = run.history.at(-1);
  if (!snapshot) return { accepted: false, economy, reason: 'no-undo-target', run };

  const undoMutation = {
    asset: 'undo' as const,
    delta: -1,
    reason: 'assist-use' as const,
    sessionId: run.session.sessionId,
  };
  const economyResult = snapshot.economyTransactionId
    ? reverseEconomyTransaction(economy, snapshot.economyTransactionId, {
        additionalMutations: [undoMutation],
        createdAt: input.createdAt,
        transactionId: `${input.transactionId}:economy`,
      })
    : applyEconomyTransaction(economy, {
        createdAt: input.createdAt,
        mutations: [undoMutation],
        transactionId: `${input.transactionId}:economy`,
      });
  if (!economyResult.applied) {
    return { accepted: false, economy, reason: 'insufficient-undo', run };
  }

  const restoredSession = {
    ...snapshot.beforeSession,
    assistUsage: restoreAssistUsage(run.session.assistUsage, snapshot),
  };
  return {
    accepted: true,
    economy: economyResult.state,
    reason: null,
    run: withProcessed(
      {
        ...run,
        history: run.history.slice(0, -1),
        session: restoredSession,
      },
      input.transactionId,
    ),
  };
}
