import type { MainTreasurerPaymentGroupType } from "@/components/main_treasurer/payments/shared";
import {
  formatCurrency,
  formatDateTime,
  getPaymentStatusBadge,
} from "@/components/main_treasurer/payments/shared";
import {
  FiCheckCircle,
  FiCreditCard,
  FiHash,
  FiMail,
  FiUser,
  FiX,
} from "react-icons/fi";

type MainTreasurerPaymentDetailsModalProps = {
  selectedPayment: MainTreasurerPaymentGroupType | null;
  onClose: () => void;
};

export default function MainTreasurerPaymentDetailsModal({
  selectedPayment,
  onClose,
}: MainTreasurerPaymentDetailsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-4xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-5 md:px-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0F2942]/60">
              Payment Record Details
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#0F2942]">
              {selectedPayment?.applicantName ?? "Payment Details"}
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Review the full payment breakdown for this application.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-gray-200 text-[#0F2942] transition-colors hover:bg-gray-50"
            aria-label="Close payment details"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-5 py-5 md:px-7 md:py-6">
          {!selectedPayment ? (
            <div className="rounded-3xl border border-gray-200 bg-gray-50 px-5 py-8 text-center">
              <p className="text-sm font-semibold text-gray-700">
                This payment record is no longer available.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                      <FiCreditCard />
                      Main Treasurer View
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#0F2942] md:text-2xl">
                        {selectedPayment.applicantName}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm font-medium text-gray-600">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                          <FiMail className="text-[#0F2942]" />
                          {selectedPayment.applicantEmail}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                          <FiHash className="text-[#0F2942]" />
                          {selectedPayment.applicationId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
                        getPaymentStatusBadge(selectedPayment.paymentStatus)
                          .className
                      }`}
                    >
                      {getPaymentStatusBadge(selectedPayment.paymentStatus).label}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                      Permit
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#0F2942]">
                      {selectedPayment.permitType}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                      Total Amount
                    </p>
                    <p className="mt-2 text-2xl font-black text-[#0F2942]">
                      {formatCurrency(selectedPayment.totalAmount)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                      Generated
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#0F2942]">
                      {formatDateTime(selectedPayment.generatedAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                      QR Status
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#0F2942]">
                      {selectedPayment.combinedQrValue
                        ? "Combined owner QR ready"
                        : "QR not available"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3C9] text-[#0F2942]">
                      <FiUser className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                        Departments
                      </p>
                      <p className="text-2xl font-black text-[#0F2942]">
                        {selectedPayment.assessments.length}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-500">
                    Departments included in this payment record.
                  </p>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <FiCheckCircle className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                        Payment Progress
                      </p>
                      <p className="text-2xl font-black text-[#0F2942]">
                        {selectedPayment.paidCount}/
                        {selectedPayment.assessments.length}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-500">
                    Department payments already marked as paid.
                  </p>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <FiCreditCard className="text-xl" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                        Last Payment Update
                      </p>
                      <p className="text-base font-black text-[#0F2942]">
                        {selectedPayment.paymentStatus === "paid"
                          ? selectedPayment.statusUpdatedAt
                            ? formatDateTime(selectedPayment.statusUpdatedAt)
                            : "Recorded with payment update"
                          : "Waiting for payment"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-500">
                    {selectedPayment.statusUpdatedByName
                      ? `Last updated by ${selectedPayment.statusUpdatedByName}.`
                      : selectedPayment.paymentStatus === "paid"
                        ? "This payment is treated as completed once paid."
                        : "The owner has not completed payment yet."}
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-[#0F2942]">
                      Department Breakdown
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      Each department included in the selected payment row.
                    </p>
                  </div>
                  <span className="inline-flex rounded-full bg-[#FFF3C9] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]">
                    {selectedPayment.assessments.length} line item
                    {selectedPayment.assessments.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {Array.from(selectedPayment.assessments)
                    .sort((a, b) =>
                      a.departmentName.localeCompare(b.departmentName),
                    )
                    .map((assessment) => (
                      <div
                        key={`${selectedPayment.applicationId}_${assessment.departmentId}`}
                        className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-black text-[#0F2942]">
                              {assessment.departmentName}
                            </p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                              Department ID: {assessment.departmentId}
                            </p>
                          </div>
                          <p className="text-base font-black text-[#0F2942]">
                            {formatCurrency(assessment.totalAmount)}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
                              getPaymentStatusBadge(assessment.paymentStatus)
                                .className
                            }`}
                          >
                            {getPaymentStatusBadge(assessment.paymentStatus).label}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl border border-white bg-white px-4 py-3">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                              Generated
                            </p>
                            <p className="mt-2 text-sm font-bold text-[#0F2942]">
                              {formatDateTime(assessment.generatedAt)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white bg-white px-4 py-3">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                              Last Update
                            </p>
                            <p className="mt-2 text-sm font-bold text-[#0F2942]">
                              {assessment.statusUpdatedByName
                                ? assessment.statusUpdatedByName
                                : assessment.paymentStatus === "paid"
                                  ? "Treasurer"
                                  : "Waiting for payment"}
                            </p>
                            <p className="mt-1 text-xs font-medium text-gray-500">
                              {assessment.statusUpdatedAt
                                ? formatDateTime(assessment.statusUpdatedAt)
                                : assessment.paymentStatus === "paid"
                                  ? "Recorded with payment update"
                                  : "No payment recorded yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-[#0F2942] transition-colors hover:bg-gray-50"
                >
                  Close Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
