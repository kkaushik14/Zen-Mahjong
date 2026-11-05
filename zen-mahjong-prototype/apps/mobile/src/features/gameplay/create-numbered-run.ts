import { createLevelDefinition, getTierPosition } from '@zen-mahjong/game-content';
import {
  createConcentrationRun,
  createConcentrationSession,
  createFixtureState,
  generateLevelBoard,
  type OfflineSaveV2,
} from '@zen-mahjong/game-engine';

export function createNumberedRun(save: OfflineSaveV2, startedAt: string) {
  const levelNumber = save.progression.currentLevelNumber;
  const position = getTierPosition(levelNumber);
  const seed = `level-${levelNumber}:v0.3.0`;
  // Special artwork is still unapproved; preserve the documented prototype fallback.
  const definition =
    position.category === 'special'
      ? null
      : createLevelDefinition({
          boardSize: position.category === 'super' ? 72 : 36,
          levelNumber,
          seed,
        });
  return createConcentrationRun(
    createConcentrationSession({
      category: position.category,
      game: definition
        ? generateLevelBoard(definition).initialState
        : createFixtureState('garden-two', seed),
      levelContentVersion: definition?.contentVersion ?? '0.3.0-presentation-fixture',
      levelNumber,
      sessionId: `level-${levelNumber}:${startedAt}`,
      startedAt,
    }),
  );
}
