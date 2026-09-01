const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toDate = (value: string): Date | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (DATE_ONLY_PATTERN.test(trimmed)) {
    const [yearRaw, monthRaw, dayRaw] = trimmed.split("-");
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return null;
    }
    const dateOnly = new Date(year, month - 1, day);
    return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatTextualDate = (value: string): string => {
  const date = toDate(value);
  if (!date) return value.trim();

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};
