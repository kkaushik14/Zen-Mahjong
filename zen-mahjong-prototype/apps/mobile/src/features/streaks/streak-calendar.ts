export type CalendarDayState = 'future' | 'missed' | 'played' | 'today';

export interface CalendarDay {
  dateKey: string;
  day: number;
  state: CalendarDayState;
}

export interface StreakCalendarPresentation {
  monthCells: readonly (CalendarDay | null)[];
  monthLabel: string;
  nextMilestone: 7 | 14 | 21 | null;
  weekDays: readonly CalendarDay[];
}

function dateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function parseDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return dateKey(date) === value ? date : null;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getPlayedDates(lastVisitLocalDate: string | null, current: number): Set<string> {
  const lastVisit = lastVisitLocalDate ? parseDateKey(lastVisitLocalDate) : null;
  const dates = new Set<string>();
  if (!lastVisit) return dates;
  for (let offset = 0; offset < current; offset += 1) {
    dates.add(dateKey(addDays(lastVisit, -offset)));
  }
  return dates;
}

function getState(day: Date, today: Date, playedDates: Set<string>): CalendarDayState {
  const key = dateKey(day);
  if (key === dateKey(today)) return 'today';
  if (playedDates.has(key)) return 'played';
  return day.getTime() > today.getTime() ? 'future' : 'missed';
}

export function buildStreakCalendar(input: {
  current: number;
  lastVisitLocalDate: string | null;
  now: Date;
}): StreakCalendarPresentation {
  const today = new Date(input.now.getFullYear(), input.now.getMonth(), input.now.getDate(), 12);
  const playedDates = getPlayedDates(input.lastVisitLocalDate, input.current);
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = addDays(today, -mondayOffset);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(monday, index);
    return { dateKey: dateKey(day), day: day.getDate(), state: getState(day, today, playedDates) };
  });

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const leadingBlankCount = (firstOfMonth.getDay() + 6) % 7;
  const monthCells: (CalendarDay | null)[] = Array.from({ length: leadingBlankCount }, () => null);
  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const day = new Date(today.getFullYear(), today.getMonth(), dayNumber, 12);
    monthCells.push({
      dateKey: dateKey(day),
      day: dayNumber,
      state: getState(day, today, playedDates),
    });
  }

  return {
    monthCells,
    monthLabel: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(today),
    nextMilestone: input.current < 7 ? 7 : input.current < 14 ? 14 : input.current < 21 ? 21 : null,
    weekDays,
  };
}
