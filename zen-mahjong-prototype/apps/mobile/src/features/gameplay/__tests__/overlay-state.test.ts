import { getRecoveryOverlayKind } from '../overlay-state';

describe('V3-17 recovery overlay state', () => {
  it('uses Full Tray for a blocked session with Special recovery', () => {
    expect(getRecoveryOverlayKind({ regularTray: ['a', 'b', 'c', 'd'], status: 'blocked' })).toBe(
      'full-tray',
    );
  });

  it('uses Full Tray for a failed four-tile tray', () => {
    expect(getRecoveryOverlayKind({ regularTray: ['a', 'b', 'c', 'd'], status: 'failed' })).toBe(
      'full-tray',
    );
  });

  it('reserves No Moves for a genuinely stalled arrangement', () => {
    expect(getRecoveryOverlayKind({ regularTray: ['a', 'b'], status: 'failed' })).toBe('no-moves');
  });

  it('does not invent recovery for an active session', () => {
    expect(getRecoveryOverlayKind({ regularTray: [], status: 'active' })).toBeNull();
  });
});
