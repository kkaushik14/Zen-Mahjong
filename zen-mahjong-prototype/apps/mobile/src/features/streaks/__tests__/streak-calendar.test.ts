import { buildStreakCalendar } from '../streak-calendar';

describe('streak calendar', () => {
  it('maps a device-local streak onto the current week and month', () => {
    const calendar = buildStreakCalendar({
      current: 3,
      lastVisitLocalDate: '2026-10-07',
      now: new Date(2026, 9, 7, 18),
    });

    expect(calendar.monthLabel).toBe('October');
    expect(calendar.nextMilestone).toBe(7);
    expect(calendar.weekDays.map((day) => [day.day, day.state])).toEqual([
      [5, 'played'],
      [6, 'played'],
      [7, 'today'],
      [8, 'future'],
      [9, 'future'],
      [10, 'future'],
      [11, 'future'],
    ]);
    expect(calendar.monthCells.filter(Boolean)).toHaveLength(31);
  });

  it('has no next milestone after all confirmed streak rewards are earned', () => {
    const calendar = buildStreakCalendar({
      current: 21,
      lastVisitLocalDate: '2026-10-07',
      now: new Date(2026, 9, 7, 18),
    });

    expect(calendar.nextMilestone).toBeNull();
  });
});
