import { createLevelDefinition } from '@zen-mahjong/game-content';

import {
  createConcentrationRun,
  executeTrackedConcentrationCommand,
  getConcentrationHint,
  useHint,
  useShuffle,
  useUndo,
} from '../concentration-assists';
import { createConcentrationSession, executeConcentrationCommand } from '../concentration-engine';
import type { ConcentrationSessionV1 } from '../concentration-model';
import { generateLevelBoard } from '../level-generation';
import {
  applyEconomyTransaction,
  createInitialEconomyState,
  getEconomyBalances,
} from '../local-economy';
import type { MahjongTile } from '../model';
import { createGameState } from '../rules';

const createdAt = '2026-10-02T00:00:00.000Z';

function generatedSession(): ConcentrationSessionV1 {
  const definition = createLevelDefinition({
    boardSize: 36,
    levelNumber: 1,
    seed: 'assist-test-level',
  });
  const generated = generateLevelBoard(definition);
  return createConcentrationSession({
    category: definition.category,
    game: generated.initialState,
    levelContentVersion: definition.contentVersion,
    levelNumber: definition.levelNumber,
    sessionId: 'assist-session',
    startedAt: createdAt,
  });
}

function filledTraySession(category: ConcentrationSessionV1['category']): ConcentrationSessionV1 {
  const tiles = ['lotus', 'bamboo', 'crane', 'sun'].flatMap<MahjongTile>((group, index) => [
    {
      id: `${group}-one`,
      matchingGroup: group,
      motif: group,
      position: { column: 0, layer: 0, row: index * 2 },
      removed: false,
    },
    {
      id: `${group}-two`,
      matchingGroup: group,
      motif: group,
      position: { column: 0, layer: 0, row: index * 2 + 1 },
      removed: false,
    },
  ]);
  let current = createConcentrationSession({
    category,
    game: createGameState({ levelId: 'failed-tray', seed: 'failed-tray', tiles }),
    levelContentVersion: '0.3.0',
    levelNumber: 5,
    sessionId: 'failed-session',
    startedAt: createdAt,
  });
  for (const tileId of ['lotus-one', 'bamboo-one', 'crane-one', 'sun-one']) {
    const result = executeConcentrationCommand(current, { tileId, type: 'select-board-tile' });
    if (!result.accepted) throw new Error('Unable to build failed tray fixture');
    current = result.session;
  }
  return current;
}

function failedTraySession(): ConcentrationSessionV1 {
  return filledTraySession('super');
}

describe('v0.3.0 Hint and Shuffle', () => {
  it('returns a deterministic valid hint and consumes one Hint exactly once', () => {
    const initialRun = createConcentrationRun(generatedSession());
    const initialEconomy = createInitialEconomyState(createdAt);
    const preview = getConcentrationHint(initialRun.session);
    const first = useHint(initialRun, initialEconomy, {
      createdAt,
      transactionId: 'hint-1',
    });
    const retry = useHint(first.run, first.economy, {
      createdAt,
      transactionId: 'hint-1',
    });

    expect(preview).not.toBeNull();
    expect(first).toMatchObject({ accepted: true, hint: preview, reason: null });
    expect(getEconomyBalances(first.economy).hint).toBe(5);
    expect(first.run.session.assistUsage.hint).toBe(1);
    expect(retry).toMatchObject({ accepted: false, reason: 'duplicate-transaction' });
    expect(getEconomyBalances(retry.economy).hint).toBe(5);
  });

  it('creates a deterministic solvable Shuffle and consumes one balance', () => {
    const run = createConcentrationRun(generatedSession());
    const economy = createInitialEconomyState(createdAt);
    const first = useShuffle(run, economy, { createdAt, transactionId: 'shuffle-a' });
    const second = useShuffle(run, economy, { createdAt, transactionId: 'shuffle-b' });

    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(true);
    expect(first.run.session.game.tiles).toEqual(second.run.session.game.tiles);
    expect(first.solutionCommands).toEqual(second.solutionCommands);
    expect(getEconomyBalances(first.economy).shuffle).toBe(1);
    expect(first.run.session.assistUsage.shuffle).toBe(1);

    let replay = first.run.session;
    for (const command of first.solutionCommands) {
      const result = executeConcentrationCommand(replay, command);
      expect(result.accepted).toBe(true);
      replay = result.session;
    }
    expect(replay.status).toBe('won');
  });

  it('preserves a solution with an unresolved tile already in the tray', () => {
    const session = generatedSession();
    const hint = getConcentrationHint(session);
    if (!hint || hint.command.type !== 'select-board-tile') throw new Error('Expected tile hint');
    const selected = executeConcentrationCommand(session, hint.command);
    if (!selected.accepted) throw new Error('Unable to prepare tray state');
    const shuffled = useShuffle(
      createConcentrationRun(selected.session),
      createInitialEconomyState(createdAt),
      { createdAt, transactionId: 'shuffle-with-tray' },
    );

    expect(shuffled.accepted).toBe(true);
    let replay = shuffled.run.session;
    for (const command of shuffled.solutionCommands) {
      const result = executeConcentrationCommand(replay, command);
      expect(result.accepted).toBe(true);
      replay = result.session;
    }
    expect(replay.status).toBe('won');
  });

  it('preserves a special-slot recovery path for a full blocked tray', () => {
    const shuffled = useShuffle(
      createConcentrationRun(filledTraySession('normal')),
      createInitialEconomyState(createdAt),
      { createdAt, transactionId: 'shuffle-blocked-tray' },
    );

    expect(shuffled.accepted).toBe(true);
    expect(shuffled.solutionCommands[0]?.type).toBe('use-special-slot');
    let replay = shuffled.run.session;
    for (const command of shuffled.solutionCommands) {
      const result = executeConcentrationCommand(replay, command);
      expect(result.accepted).toBe(true);
      replay = result.session;
    }
    expect(replay.status).toBe('won');
  });

  it('does not charge Shuffle when a full tray has no recovery capability', () => {
    const economy = createInitialEconomyState(createdAt);
    const result = useShuffle(createConcentrationRun(failedTraySession()), economy, {
      createdAt,
      transactionId: 'shuffle-unrecoverable',
    });

    expect(result).toMatchObject({ accepted: false, reason: 'shuffle-not-solvable' });
    expect(result.economy).toBe(economy);
    expect(getEconomyBalances(result.economy).shuffle).toBe(2);
  });
});

describe('v0.3.0 transactional Undo', () => {
  it('restores the previous selection and spends one Undo', () => {
    const session = generatedSession();
    const run = createConcentrationRun(session);
    const economy = createInitialEconomyState(createdAt);
    const tileId = getConcentrationHint(session)?.command;
    if (!tileId || tileId.type !== 'select-board-tile') throw new Error('Expected tile hint');
    const selected = executeTrackedConcentrationCommand(run, economy, tileId, {
      createdAt,
      transactionId: 'select-1',
    });
    const undone = useUndo(selected.run, selected.economy, {
      createdAt,
      transactionId: 'undo-1',
    });

    expect(selected.accepted).toBe(true);
    expect(undone.accepted).toBe(true);
    expect(undone.run.session.game).toEqual(session.game);
    expect(undone.run.session.regularTray).toEqual([]);
    expect(undone.run.session.assistUsage.undo).toBe(1);
    expect(undone.run.history).toEqual([]);
    expect(getEconomyBalances(undone.economy).undo).toBe(3);
  });

  it('undoes Shuffle atomically, refunds Shuffle, and spends Undo', () => {
    const session = generatedSession();
    const shuffled = useShuffle(
      createConcentrationRun(session),
      createInitialEconomyState(createdAt),
      { createdAt, transactionId: 'shuffle-undo-target' },
    );
    const undone = useUndo(shuffled.run, shuffled.economy, {
      createdAt,
      transactionId: 'undo-shuffle',
    });

    expect(undone.accepted).toBe(true);
    expect(undone.run.session.game).toEqual(session.game);
    expect(undone.run.session.assistUsage).toEqual({ hint: 0, shuffle: 0, undo: 1 });
    expect(getEconomyBalances(undone.economy)).toMatchObject({ shuffle: 2, undo: 3 });
    expect(undone.economy.transactions.at(-1)?.reversesTransactionId).toBe(
      'shuffle-undo-target:economy',
    );
  });

  it('restores a failed session and refunds revival score through compensation', () => {
    const failedSession = failedTraySession();
    let economy = createInitialEconomyState(createdAt);
    economy = applyEconomyTransaction(economy, {
      createdAt,
      mutations: [{ asset: 'concentration-score', delta: 20, reason: 'adjustment' }],
      transactionId: 'test-score-grant',
    }).state;
    const revived = executeTrackedConcentrationCommand(
      createConcentrationRun(failedSession),
      economy,
      { availableConcentrationScore: 0, type: 'revive' },
      { createdAt, transactionId: 'revive-1' },
    );

    expect(revived.accepted).toBe(true);
    expect(getEconomyBalances(revived.economy).concentrationScore).toBe(10);
    const undone = useUndo(revived.run, revived.economy, {
      createdAt,
      transactionId: 'undo-revive',
    });

    expect(undone.accepted).toBe(true);
    expect(undone.run.session.status).toBe('failed');
    expect(undone.run.session.regularTray).toEqual(failedSession.regularTray);
    expect(undone.run.session.revivalCount).toBe(0);
    expect(getEconomyBalances(undone.economy)).toMatchObject({
      concentrationScore: 20,
      undo: 3,
    });
  });

  it('rejects Undo without history and preserves inventory', () => {
    const run = createConcentrationRun(generatedSession());
    const economy = createInitialEconomyState(createdAt);
    const result = useUndo(run, economy, { createdAt, transactionId: 'undo-empty' });

    expect(result).toMatchObject({ accepted: false, reason: 'no-undo-target' });
    expect(result.run).toBe(run);
    expect(result.economy).toBe(economy);
    expect(getEconomyBalances(result.economy).undo).toBe(4);
  });
});
