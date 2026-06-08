/**
 * Date utility functions for calendar and event handling
 */

/**
 * Get the number of days in a given month
 */
export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Get the first day of the month (0=Sunday, 6=Saturday)
 */
export const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

/**
 * Format a date as "Mon, Jan 15, 2024"
 */
export const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format a date as "Jan 15"
 */
export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Format a time as "2:30 PM"
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Get the start of day (00:00:00)
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get the end of day (23:59:59)
 */
export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Get month name (e.g., "January")
 */
export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "long" });
};

/**
 * Get year as string (e.g., "2024")
 */
export const getYearString = (date: Date): string => {
  return date.getFullYear().toString();
};

/**
 * Get array of all days in a month (with padding for previous/next month)
 * Returns 42 days (6 weeks) for calendar grid
 */
export const getMonthCalendarDays = (date: Date): Date[] => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: Date[] = [];
  let currentDate = new Date(startDate);

  // Generate 42 days (6 weeks) for calendar grid
  while (days.length < 42) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

/**
 * Parse reminder duration string to milliseconds
 */
export const reminderToMilliseconds = (reminder: string): number => {
  const reminderMap: Record<string, number> = {
    none: 0,
    "15min": 15 * 60 * 1000,
    "1hour": 60 * 60 * 1000,
    "1day": 24 * 60 * 60 * 1000,
    "1week": 7 * 24 * 60 * 60 * 1000,
  };
  return reminderMap[reminder] || 0;
};

/**
 * Get calendar days as numbers with null padding for grid display
 */
export const getCalendarDays = (date: Date): (number | null)[] => {
  const daysInMonth = getDaysInMonth(date);
  const firstDay = getFirstDayOfMonth(date);
  const days: (number | null)[] = [];

  // Add null for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};

/**
 * Get next month
 */
export const getNextMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

/**
 * Get previous month
 */
export const getPreviousMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
};

/**
 * Get the month year string (e.g., "June 2026")
 */
export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: Date): boolean => {
  return date > new Date();
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date): boolean => {
  return date < new Date();
};

/**
 * Format time until a date (e.g., "2h", "1d")
 */
export const formatTimeUntil = (date: Date): string => {
  const ms = date.getTime() - new Date().getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};
