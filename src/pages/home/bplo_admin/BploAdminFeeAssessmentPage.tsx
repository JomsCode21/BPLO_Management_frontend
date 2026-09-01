import {
  getBploAdminFeeAssessmentPermitsApi,
  getBploAdminFeeAssessmentTemplateApi,
  saveBploAdminFeeAssessmentTemplateApi,
} from "@/api/bplo_admin/bplo_admin.api";
import type { BploAdminFeeAssessmentPermitType } from "@/types/bplo_admin/bplo_admin.type";
import { useEffect, useMemo, useState } from "react";
import { FiLoader, FiPlus, FiTrash2 } from "react-icons/fi";

type RowType = {
  id: string;
  feeName: string;
  amount: number;
};

const buildRow = (seed = ""): RowType => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2)}_${seed}`,
  feeName: "",
  amount: 0,
});

export default function BploAdminFeeAssessmentPage() {
  const [permitTypes, setPermitTypes] = useState<BploAdminFeeAssessmentPermitType[]>(
    [],
  );
  const [selectedPermitId, setSelectedPermitId] = useState("");
  const [selectedPermitName, setSelectedPermitName] = useState("");
  const [items, setItems] = useState<RowType[]>([buildRow("initial")]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPermits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getBploAdminFeeAssessmentPermitsApi();
      const incoming = response.data ?? [];
      setPermitTypes(incoming);

      if (incoming.length === 0) {
        setSelectedPermitId("");
        setSelectedPermitName("");
        setItems([buildRow("empty")]);
        return;
      }

      const firstPermitId = incoming[0]?.permitId ?? "";
      setSelectedPermitId(firstPermitId);
      setSelectedPermitName(incoming[0]?.permitName ?? "");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError?.response?.data?.message ??
          "Failed to load permit types for fee assessment.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplate = async (permitId: string) => {
    if (!permitId) {
      setItems([buildRow("blank")]);
      setSelectedPermitName("");
      return;
    }

    setIsTemplateLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await getBploAdminFeeAssessmentTemplateApi(permitId);
      const payload = response.data;
      setSelectedPermitName(payload?.permitName ?? "");

      const mapped = (payload?.items ?? []).map((item, index) => ({
        id: `${Date.now()}_${index}`,
        feeName: item.feeName,
        amount: Number(item.amount ?? 0),
      }));

      setItems(mapped.length > 0 ? mapped : [buildRow("empty")]);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError?.response?.data?.message ??
          "Failed to load fee assessment template.",
      );
      setItems([buildRow("error")]);
    } finally {
      setIsTemplateLoading(false);
    }
  };

  useEffect(() => {
    void loadPermits();
  }, []);

  useEffect(() => {
    if (!selectedPermitId) return;
    void loadTemplate(selectedPermitId);
  }, [selectedPermitId]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items],
  );

  const addRow = () => {
    setItems((prev) => [...prev, buildRow(String(prev.length + 1))]);
  };

  const removeRow = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      return next.length > 0 ? next : [buildRow("fallback")];
    });
  };

  const updateRow = (id: string, field: "feeName" | "amount", value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "amount" ? Number(value || 0) : value,
            }
          : item,
      ),
    );
  };

  const saveTemplate = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedPermitId) {
      setError("Select a permit type first.");
      return;
    }

    const cleaned = items
      .map((item) => ({
        feeName: item.feeName.trim(),
        amount: Number(item.amount ?? 0),
      }))
      .filter((item) => item.feeName.length > 0);

    if (cleaned.length === 0) {
      setError("Add at least one fee item before saving.");
      return;
    }

    if (cleaned.some((item) => !Number.isFinite(item.amount) || item.amount < 0)) {
      setError("Fee amount cannot be negative.");
      return;
    }

    setIsSaving(true);
    try {
      await saveBploAdminFeeAssessmentTemplateApi(selectedPermitId, {
        items: cleaned,
      });
      setSuccess("Fee assessment template saved successfully.");
      await loadTemplate(selectedPermitId);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError?.response?.data?.message ??
          "Failed to save fee assessment template.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-bplo-admin-tour="fee-assessment-header"
      >
        <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
          Admin Fee Assessment Setup
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure fee assessment per permit type.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 space-y-5">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center text-[#0F2942] font-semibold">
            <FiLoader className="animate-spin mr-2" /> Loading permit types...
          </div>
        ) : permitTypes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center text-sm font-semibold text-gray-500">
            No permit types available for fee setup.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label
                  htmlFor="permit-type-select"
                  className="text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]"
                >
                  Permit Type
                </label>
                <select
                  id="permit-type-select"
                  value={selectedPermitId}
                  onChange={(event) => setSelectedPermitId(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#0F2942] outline-none focus:border-[#0F2942]"
                >
                  {permitTypes.map((permitType) => (
                    <option key={permitType.permitId} value={permitType.permitId}>
                      {permitType.permitName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                  Selected
                </p>
                <p className="mt-1 text-sm font-bold text-[#0F2942]">
                  {selectedPermitName || "N/A"}
                </p>
              </div>
            </div>

            {isTemplateLoading ? (
              <div className="py-16 flex items-center justify-center text-[#0F2942] font-semibold">
                <FiLoader className="animate-spin mr-2" /> Loading assessment template...
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_180px_56px] gap-3 items-center"
                  >
                    <input
                      type="text"
                      value={item.feeName}
                      onChange={(event) =>
                        updateRow(item.id, "feeName", event.target.value)
                      }
                      placeholder="Fee name"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.amount}
                      onChange={(event) =>
                        updateRow(item.id, "amount", event.target.value)
                      }
                      placeholder="Amount"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(item.id)}
                      className="h-12 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Remove fee"
                    >
                      <FiTrash2 className="mx-auto" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#0F2942] px-4 py-2 text-sm font-bold text-[#0F2942] hover:bg-[#F4F8FC] cursor-pointer"
                  >
                    <FiPlus /> Add Fee Row
                  </button>

                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Total Amount
                    </p>
                    <p className="text-2xl font-black text-[#0F2942]">
                      PHP{" "}
                      {totalAmount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void saveTemplate()}
                    disabled={isSaving}
                    className="rounded-xl bg-[#0F2942] px-6 py-3 text-sm font-bold text-white hover:bg-[#1E3A56] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Assessment Template"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
