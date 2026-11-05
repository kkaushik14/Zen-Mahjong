import { createConcentrationSession } from '../concentration-engine';
import { createFixtureState } from '../fixtures';
import {
  getActiveDurationMs,
  getActiveDurationSeconds,
  pauseSessionTiming,
  resumeSessionTiming,
} from '../timing';

function activeSession() {
  return createConcentrationSession({
    category: 'normal',
    game: createFixtureState('flat-introduction'),
    levelContentVersion: '0.3.0',
    levelNumber: 1,
    sessionId: 'timing-session',
    startedAt: '2026-10-02T00:00:00.000Z',
  });
}

describe('v0.3.0 foreground timing', () => {
  it('starts with gameplay, excludes background time, and resumes from the saved duration', () => {
    const started = activeSession();
    const backgrounded = pauseSessionTiming(started, '2026-10-02T00:00:30.000Z');
    const resumed = resumeSessionTiming(backgrounded, '2026-10-02T00:01:00.000Z');
    const pausedAgain = pauseSessionTiming(resumed, '2026-10-02T00:01:20.000Z');

    expect(started.activeSince).toBe('2026-10-02T00:00:00.000Z');
    expect(backgrounded.activeElapsedMs).toBe(30_000);
    expect(resumed.activeElapsedMs).toBe(30_000);
    expect(pausedAgain.activeElapsedMs).toBe(50_000);
    expect(getActiveDurationSeconds(pausedAgain)).toBe(50);
  });

  it('measures a running session without mutating it', () => {
    const session = activeSession();

    expect(getActiveDurationMs(session, '2026-10-02T00:00:12.500Z')).toBe(12_500);
    expect(session.activeElapsedMs).toBe(0);
  });

  it('does not reduce elapsed time when the device clock moves backward', () => {
    const session = activeSession();
    const paused = pauseSessionTiming(session, '2026-10-01T23:59:00.000Z');

    expect(paused.activeElapsedMs).toBe(0);
    expect(paused.activeSince).toBeNull();
  });

  it('does not resume completed or failed sessions', () => {
    const session = pauseSessionTiming(activeSession(), '2026-10-02T00:00:10.000Z');

    expect(
      resumeSessionTiming({ ...session, status: 'won' }, '2026-10-02T00:01:00.000Z'),
    ).toMatchObject({ activeSince: null });
    expect(
      resumeSessionTiming({ ...session, status: 'failed' }, '2026-10-02T00:01:00.000Z'),
    ).toMatchObject({ activeSince: null });
  });
});
