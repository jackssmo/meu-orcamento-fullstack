function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

function lastBusinessDayOfMonth(year: number, month: number): Date {
  const date = new Date(Date.UTC(year, month + 1, 0));
  while (!isWeekday(date)) {
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return date;
}

function isLastBusinessDayOfMonth(date: Date): boolean {
  if (!isWeekday(date)) return false;
  const nextBusinessDay = new Date(date);
  nextBusinessDay.setUTCDate(nextBusinessDay.getUTCDate() + 1);
  while (!isWeekday(nextBusinessDay)) {
    nextBusinessDay.setUTCDate(nextBusinessDay.getUTCDate() + 1);
  }
  return nextBusinessDay.getUTCMonth() !== date.getUTCMonth();
}

export function getMonthlyOccurrenceDate(startDate: Date, monthOffset: number): Date {
  const targetMonth = startDate.getUTCMonth() + monthOffset;
  const targetYear = startDate.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;

  if (isLastBusinessDayOfMonth(startDate)) {
    return lastBusinessDayOfMonth(targetYear, normalizedMonth);
  }

  const daysInTargetMonth = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(
    targetYear,
    normalizedMonth,
    Math.min(startDate.getUTCDate(), daysInTargetMonth),
  ));
}
