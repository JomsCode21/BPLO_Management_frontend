import type { InspectorDashboardType } from "@/types/inspector/inspector.type";

export type InspectorResultChartDatum = {
  label: string;
  value: number;
  fill: string;
  legendColor: string;
  badgeFill: string;
  badgeTextColor: string;
  note: string;
};

export type InspectorMonthlyInspectionDatum =
  InspectorDashboardType["monthlyInspections"][number];

export type InspectorPeakMonth = InspectorDashboardType["peakMonth"];

export type InspectorBusiestWeekday =
  InspectorDashboardType["analytics"]["busiestWeekday"];

export const formatNumber = (value: number) =>
  Number(value ?? 0).toLocaleString("en-PH");

export const shouldRenderMonthLabel = (
  index: number,
  totalItems: number,
  isCompactLayout = false,
) => {
  if (isCompactLayout) {
    if (totalItems <= 4) return true;
    if (totalItems <= 8) return index % 2 === 0 || index === totalItems - 1;
    return index % 3 === 0 || index === totalItems - 1;
  }

  if (totalItems <= 7) return true;
  if (totalItems <= 12) return index % 2 === 0 || index === totalItems - 1;
  return index % 3 === 0 || index === totalItems - 1;
};
