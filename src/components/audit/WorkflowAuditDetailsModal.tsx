import { FiX } from "react-icons/fi";

type WorkflowAuditDetailsEvent = {
  _id: string;
  applicationId?: string;
  permitName?: string;
  applicantName?: string;
  applicantEmail?: string;
  statusCode?: string;
  source?: string;
  actorName?: string;
  remark?: string;
  totalAmountToSettle?: number;
  amountPaid?: number;
  paymentBreakdown?: Array<{
    departmentName?: string;
    amount?: number;
    paymentStatus?: string;
  }>;
  inspectionInspectorName?: string;
  inspectionDepartmentName?: string;
  approvalDate?: string | null;
  occurredAt?: string | null;
};

type WorkflowAuditDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event: WorkflowAuditDetailsEvent | null;
  title: string;
  showApplicantEmail?: boolean;
  showSource?: boolean;
};

const normalizeLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const displayOrDash = (value?: string | null) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));

export default function WorkflowAuditDetailsModal(
  props: WorkflowAuditDetailsModalProps,
) {
  if (!props.isOpen || !props.event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4"
      onClick={props.onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-gray-100 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 md:px-6">
          <div>
            <h2 className="text-xl font-black text-[#0F2942]">{props.title}</h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Full workflow event details.
            </p>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50"
            aria-label="Close details"
          >
            <FiX />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-5 text-sm md:grid-cols-2 md:px-6 md:py-5">
          <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              When
            </p>
            <p className="mt-1 font-semibold text-[#0F2942]">
              {formatDateTime(props.event.occurredAt)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Status
            </p>
            <p className="mt-1 font-semibold text-[#0F2942]">
              {normalizeLabel(displayOrDash(props.event.statusCode))}
            </p>
          </div>

          {props.showSource !== false && (
            <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
                Source
              </p>
              <p className="mt-1 font-semibold text-[#0F2942]">
                {normalizeLabel(displayOrDash(props.event.source))}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Actor
            </p>
            <p className="mt-1 font-semibold text-[#0F2942]">
              {displayOrDash(props.event.actorName)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Permit
            </p>
            <p className="mt-1 font-semibold text-[#0F2942]">
              {displayOrDash(props.event.permitName)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Applicant
            </p>
            <p className="mt-1 font-semibold text-[#0F2942]">
              {displayOrDash(props.event.applicantName)}
            </p>
            {props.showApplicantEmail !== false && props.event.applicantEmail && (
              <p className="mt-1 text-xs text-gray-500">{props.event.applicantEmail}</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] px-4 py-3 md:col-span-2">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
              Remark
            </p>
            <p className="mt-1 whitespace-pre-wrap font-medium text-[#0F2942]">
              {displayOrDash(props.event.remark)}
            </p>
          </div>

          {(props.event.inspectionInspectorName ||
            props.event.inspectionDepartmentName ||
            props.event.approvalDate) && (
            <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] px-4 py-3 md:col-span-2">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
                Inspection Approval
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                <p className="rounded-lg bg-white px-3 py-2 font-medium text-[#0F2942]">
                  Inspector: {displayOrDash(props.event.inspectionInspectorName)}
                </p>
                <p className="rounded-lg bg-white px-3 py-2 font-medium text-[#0F2942]">
                  Department: {displayOrDash(props.event.inspectionDepartmentName)}
                </p>
                <p className="rounded-lg bg-white px-3 py-2 font-medium text-[#0F2942]">
                  Approval Date: {formatDateTime(props.event.approvalDate)}
                </p>
              </div>
            </div>
          )}

          {(props.event.paymentBreakdown ?? []).length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] px-4 py-3 md:col-span-2">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
                Payment Breakdown
              </p>
              <div className="mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white">
                <table className="min-w-full table-auto border-collapse text-left">
                  <thead className="bg-gray-50 text-[11px] font-black uppercase tracking-[0.14em] text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.event.paymentBreakdown?.map((item, index) => (
                      <tr
                        key={`${displayOrDash(item.departmentName)}-${index}`}
                        className="border-t border-gray-100 text-sm text-[#0F2942]"
                      >
                        <td className="px-3 py-2">{displayOrDash(item.departmentName)}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <p className="rounded-lg bg-white px-3 py-2 font-semibold text-[#0F2942]">
                  Total To Settle: {formatCurrency(props.event.totalAmountToSettle)}
                </p>
                <p className="rounded-lg bg-white px-3 py-2 font-semibold text-emerald-700">
                  Amount Paid: {formatCurrency(props.event.amountPaid)}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
