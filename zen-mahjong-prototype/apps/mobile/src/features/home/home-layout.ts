const MAXIMUM_PHONE_WIDTH = 430;
const HOME_GUTTER = 16;
const PRIMARY_GUTTER = 24;

export interface HomeLayoutMetrics {
  contentWidth: number;
  left: number;
  primaryWidth: number;
  settingsTop: number;
  shellWidth: number;
}

export function getHomeLayoutMetrics(
  viewportWidth: number,
  viewportHeight: number,
): HomeLayoutMetrics {
  const shellWidth = Math.min(Math.max(viewportWidth, 0), MAXIMUM_PHONE_WIDTH);
  const settingsTop =
    viewportHeight < 844
      ? 721 + (viewportHeight - 844) * (17 / 44)
      : 721 + (viewportHeight - 844) / 2;

  return {
    contentWidth: Math.max(0, shellWidth - HOME_GUTTER * 2),
    left: Math.max(0, (viewportWidth - shellWidth) / 2),
    primaryWidth: Math.max(0, shellWidth - PRIMARY_GUTTER * 2),
    settingsTop,
    shellWidth,
  };
}
