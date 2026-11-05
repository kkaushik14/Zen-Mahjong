export function fixedClock(isoDate = '2026-09-25T00:00:00.000Z'): () => Date {
  return () => new Date(isoDate);
}
