import type { ConcentrationSessionV1 } from './concentration-model';

function timestamp(value: string, name: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new RangeError(`${name} must be a valid timestamp`);
  return parsed;
}

export function pauseSessionTiming(
  session: ConcentrationSessionV1,
  pausedAt: string,
): ConcentrationSessionV1 {
  if (session.activeSince === null) return session;

  const activeSince = timestamp(session.activeSince, 'activeSince');
  const paused = timestamp(pausedAt, 'pausedAt');
  return {
    ...session,
    activeElapsedMs: session.activeElapsedMs + Math.max(0, paused - activeSince),
    activeSince: null,
  };
}

export function resumeSessionTiming(
  session: ConcentrationSessionV1,
  resumedAt: string,
): ConcentrationSessionV1 {
  if (session.activeSince !== null || session.status === 'won' || session.status === 'failed') {
    return session;
  }
  timestamp(resumedAt, 'resumedAt');
  return { ...session, activeSince: resumedAt };
}

export function getActiveDurationMs(session: ConcentrationSessionV1, measuredAt?: string): number {
  if (session.activeSince === null) return session.activeElapsedMs;
  if (!measuredAt) throw new RangeError('measuredAt is required while timing is active');
  const elapsed = Math.max(
    0,
    timestamp(measuredAt, 'measuredAt') - timestamp(session.activeSince, 'activeSince'),
  );
  return session.activeElapsedMs + elapsed;
}

export function getActiveDurationSeconds(session: ConcentrationSessionV1): number {
  if (session.activeSince !== null) {
    throw new RangeError('Session timing must be paused before completion is measured');
  }
  return Math.floor(session.activeElapsedMs / 1000);
}
