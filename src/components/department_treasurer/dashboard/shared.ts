export type TimeWindow = 7 | 30;

export type TrendPoint = {
  key: string;
  label: string;
  fullLabel: string;
  count: number;
};

export type StatusChartDatum = {
  label: string;
  value: number;
  fill: string;
};

export const formatNumber = (value: number) =>
  Number(value ?? 0).toLocaleString("en-PH");

export const formatCurrency = (value: number) =>
  `PHP ${Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDateTime = (value?: string | null) => {
  if (!value) return "Not available";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const shouldRenderTrendLabel = (index: number, totalItems: number) => {
  if (totalItems <= 7) return true;
  if (totalItems <= 14) return index % 2 === 0 || index === totalItems - 1;
  if (totalItems <= 21) return index % 3 === 0 || index === totalItems - 1;
  return index % 5 === 0 || index === totalItems - 1;
};
