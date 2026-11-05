const MAXIMUM_PHONE_WIDTH = 430;

export interface GameplayLayoutMetrics {
  boardHeight: number;
  boardTop: number;
  contentWidth: number;
  dockTop: number;
  left: number;
  shellWidth: number;
  trayTop: number;
  trayWidth: number;
}

export function getGameplayLayoutMetrics(
  viewportWidth: number,
  viewportHeight: number,
): GameplayLayoutMetrics {
  const shellWidth = Math.min(Math.max(0, viewportWidth), MAXIMUM_PHONE_WIDTH);
  const boardTop = 120;
  const trayTop = viewportHeight - (viewportHeight <= 800 ? 222 : 224);

  return {
    boardHeight: Math.max(240, trayTop - boardTop - 18),
    boardTop,
    contentWidth: Math.max(0, shellWidth - 32),
    dockTop: trayTop + 88,
    left: Math.max(0, (viewportWidth - shellWidth) / 2),
    shellWidth,
    trayTop,
    trayWidth: Math.min(342, Math.max(0, shellWidth - 32)),
  };
}
