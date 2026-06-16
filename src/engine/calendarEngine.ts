

export type CalendarDay = {
  date: Date;
  iso: string;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isFuture: boolean;
};

export type CyclePrediction = {
  fertileStart: Date;
  fertileEnd: Date;
  ovulationDay: Date;
  nextPeriodStart: Date;
};

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export function formatDate(date: Date): string {
  // Use local getters — toISOString() is UTC and causes off-by-one in UTC+ near midnight
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return formatDate(a) === formatDate(b);
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

export function generateCyclePrediction(
  lastPeriodStart: Date,
  cycleLength: number = DEFAULT_CYCLE_LENGTH
): CyclePrediction {
  const nextPeriodStart = addDays(lastPeriodStart, cycleLength);

  const ovulationDay = addDays(nextPeriodStart, -14);

  const fertileStart = addDays(ovulationDay, -5);
  const fertileEnd = addDays(ovulationDay, 1);

  return {
    fertileStart,
    fertileEnd,
    ovulationDay,
    nextPeriodStart,
  };
}

export function isPeriodDay(
  date: Date,
  periodStart: Date,
  periodLength: number = DEFAULT_PERIOD_LENGTH
): boolean {
  // String comparison avoids UTC-vs-local midnight mismatches
  const dateStr = formatDate(date);
  const startStr = formatDate(periodStart);
  const endDate = new Date(
    periodStart.getFullYear(),
    periodStart.getMonth(),
    periodStart.getDate() + periodLength - 1
  );
  return dateStr >= startStr && dateStr <= formatDate(endDate);
}

export function isFertileDay(
  date: Date,
  fertileStart: Date,
  fertileEnd: Date
): boolean {
  const dateStr = formatDate(date);
  return dateStr >= formatDate(fertileStart) && dateStr <= formatDate(fertileEnd);
}

export function isOvulationDay(
  date: Date,
  ovulationDay: Date
): boolean {
  return isSameDay(date, ovulationDay);
}

export function generateMonthCalendar(
  year: number,
  month: number,
  lastPeriodStart: Date,
  cycleLength: number = DEFAULT_CYCLE_LENGTH,
  periodLength: number = DEFAULT_PERIOD_LENGTH
): CalendarDay[] {
  const today = new Date();

  const prediction = generateCyclePrediction(
    lastPeriodStart,
    cycleLength
  );

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startWeekDay = firstDay.getDay();

  const days: CalendarDay[] = [];

  for (let i = 0; i < startWeekDay; i++) {
    const prevDate = new Date(year, month, i - startWeekDay + 1);

    days.push({
      date: prevDate,
      iso: formatDate(prevDate),
      dayNumber: prevDate.getDate(),
      isToday: isSameDay(prevDate, today),
      isCurrentMonth: false,
      isPeriod: false,
      isFertile: false,
      isOvulation: false,
      isFuture: prevDate > today,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    days.push({
      date,
      iso: formatDate(date),
      dayNumber: day,
      isToday: isSameDay(date, today),
      isCurrentMonth: true,
      isPeriod:
        isPeriodDay(date, lastPeriodStart, periodLength) ||
        isPeriodDay(date, prediction.nextPeriodStart, periodLength),
      isFertile: isFertileDay(
        date,
        prediction.fertileStart,
        prediction.fertileEnd
      ),
      isOvulation: isOvulationDay(
        date,
        prediction.ovulationDay
      ),
      isFuture: date > today,
    });
  }

  while (days.length % 7 !== 0) {
    const nextIndex = days.length - (startWeekDay + daysInMonth) + 1;

    const nextDate = new Date(
      year,
      month + 1,
      nextIndex
    );

    days.push({
      date: nextDate,
      iso: formatDate(nextDate),
      dayNumber: nextDate.getDate(),
      isToday: isSameDay(nextDate, today),
      isCurrentMonth: false,
      isPeriod: false,
      isFertile: false,
      isOvulation: false,
      isFuture: nextDate > today,
    });
  }

  return days;
}

export function calculateCycleDay(
  lastPeriodStart: Date
): number {
  const today = new Date();

  const diff = Math.floor(
    (today.getTime() - lastPeriodStart.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return diff + 1;
}

export function detectDelayedPeriod(
  lastPeriodStart: Date,
  cycleLength: number = DEFAULT_CYCLE_LENGTH
): boolean {
  const today = new Date();

  const expectedPeriod = addDays(
    lastPeriodStart,
    cycleLength
  );

  return today > expectedPeriod;
}