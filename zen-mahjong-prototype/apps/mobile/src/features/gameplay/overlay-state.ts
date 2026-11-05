import type { ConcentrationSessionV1 } from '@zen-mahjong/game-engine';

export type RecoveryOverlayKind = 'full-tray' | 'no-moves' | null;

export function getRecoveryOverlayKind(
  session: Pick<ConcentrationSessionV1, 'regularTray' | 'status'>,
): RecoveryOverlayKind {
  if (session.status === 'blocked') return 'full-tray';
  if (session.status !== 'failed') return null;
  return session.regularTray.length >= 4 ? 'full-tray' : 'no-moves';
}
