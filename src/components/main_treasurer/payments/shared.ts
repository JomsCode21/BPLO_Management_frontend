import type { MainTreasurerPaymentType } from "@/types/treasurer/treasurer.type";

export type MainTreasurerPaymentGroupType = {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  permitType: string;
  combinedQrValue: string;
  generatedAt?: string | null;
  statusUpdatedAt?: string | null;
  statusUpdatedByName?: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid";
  assessments: MainTreasurerPaymentType[];
  paidCount: number;
};

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

export const getPaymentStatusBadge = (status: "pending" | "paid") => {
  if (status === "paid") {
    return {
      label: "Paid",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  return {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
  };
};
