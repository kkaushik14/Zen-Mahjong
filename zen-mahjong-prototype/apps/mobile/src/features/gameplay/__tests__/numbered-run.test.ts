import {
  createInitialOfflineSave,
  executeConcentrationCommand,
  getConcentrationHint,
} from '@zen-mahjong/game-engine';
import { createNumberedRun } from '../create-numbered-run';

describe('numbered gameplay integration', () => {
  it.each([1, 2, 3, 4, 5, 6, 9, 10])(
    'starts and clears generated level %i without spending assists',
    (levelNumber) => {
      const initial = createInitialOfflineSave('2026-10-11T00:00:00.000Z');
      const save = {
        ...initial,
        progression: { ...initial.progression, currentLevelNumber: levelNumber },
      };
      const run = createNumberedRun(save, '2026-10-11T00:00:00.000Z');
      expect(run.session.game.levelId).toBe(`level-${levelNumber}`);
      expect(run.session.levelContentVersion).toBe('0.3.0');
      let session = run.session;
      for (let step = 0; step < run.session.game.initialTiles.length; step += 1) {
        const hint = getConcentrationHint(session);
        expect(hint).not.toBeNull();
        if (!hint) throw new Error('Generated board has no continuation');
        const result = executeConcentrationCommand(session, hint.command);
        expect(result.accepted).toBe(true);
        session = result.session;
      }
      expect(session.status).toBe('won');
      expect(session.assistUsage).toEqual({ hint: 0, shuffle: 0, undo: 0 });
    },
  );
});
