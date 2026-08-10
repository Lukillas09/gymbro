export type CalendarDayState =
  "empty" | "scheduled" | "completed" | "training" | "scheduled-and-completed";

export type CalendarScheduledDay = Readonly<{
  id: string;
  name: string;
  position: number;
  weekday: number;
  exerciseCount: number;
  primaryMuscleGroups: readonly string[];
}>;

export type CalendarWorkout = Readonly<{
  id: string;
  routineDayId: string | null;
  routineName: string;
  dayName: string;
  startedAt: string;
  completedAt: string | null;
  status: "completed" | "in_progress";
  completedSetCount: number;
}>;

export type CalendarDay = Readonly<{
  dateKey: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  state: CalendarDayState;
  scheduledDays: readonly CalendarScheduledDay[];
  completedSessions: readonly CalendarWorkout[];
  activeSession: CalendarWorkout | null;
}>;

export type CalendarScheduleStatus = "none" | "partial" | "complete";

export type CalendarMonth = Readonly<{
  monthKey: string;
  monthLabel: string;
  previousMonthKey: string;
  nextMonthKey: string;
  visibleStartDateKey: string;
  visibleEndDateKey: string;
  selectedDateKey: string;
  todayDateKey: string;
  days: readonly CalendarDay[];
}>;

export type CalendarPageModel = Readonly<{
  month: CalendarMonth;
  selectedDay: CalendarDay;
  activeSession: CalendarWorkout | null;
  scheduleStatus: CalendarScheduleStatus;
  hasActiveRoutine: boolean;
  hasAnyWorkout: boolean;
}>;

export type CalendarMonthFrame = Readonly<{
  monthKey: string;
  monthLabel: string;
  previousMonthKey: string;
  nextMonthKey: string;
  firstDateKey: string;
  endDateKey: string;
  dateKeys: readonly string[];
}>;
