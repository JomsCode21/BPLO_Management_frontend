import {
  getDepartmentFeeAssessmentTemplateApi,
  saveDepartmentFeeAssessmentTemplateApi,
} from "@/api/treasurer/treasurer.api";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import type { DepartmentFeeAssessmentItemType } from "@/types/treasurer/treasurer.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

type RowType = DepartmentFeeAssessmentItemType & { id: string };

const buildRow = (seed = ""): RowType => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2)}_${seed}`,
  feeName: "",
  amount: 0,
});

export default function DepartmentTreasurerFeeAssessmentPage() {
  const [departmentName, setDepartmentName] = useState("");
  const [items, setItems] = useState<RowType[]>([buildRow("initial")]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTemplate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDepartmentFeeAssessmentTemplateApi();
      const payload = response.data;
      setDepartmentName(payload?.departmentName ?? "");

      const mapped = (payload?.items ?? []).map((item, index) => ({
        id: `${Date.now()}_${index}`,
        feeName: item.feeName,
        amount: Number(item.amount ?? 0),
      }));

      setItems(mapped.length > 0 ? mapped : [buildRow("empty")]);
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        setError(null);
        return;
      }

      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message ?? "Failed to load fee assessment template.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplate();
  }, []);

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

    const cleaned = items
      .map((item) => ({
        feeName: item.feeName.trim(),
        amount: Number(item.amount ?? 0),
      }))
      .filter((item) => item.feeName.length > 0);
    // Empty fee names are dropped so accidental blank rows are not persisted.

    if (cleaned.length === 0) {
      setError("Add at least one fee item before saving.");
      return;
    }

    if (cleaned.some((item) => item.amount < 0)) {
      setError("Fee amount cannot be negative.");
      return;
    }

    setIsSaving(true);
    try {
      await saveDepartmentFeeAssessmentTemplateApi({ items: cleaned });
      setSuccess("Fee assessment template saved successfully.");
      // Reload to reflect any server-side normalization/rules.
      await loadTemplate();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message ?? "Failed to save fee assessment template.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
        <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
          Fee Assessment Setup
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure the standard payment breakdown for {departmentName || "your department"}.
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

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_180px_56px] gap-3 items-center">
                <input
                  type="text"
                  value={item.feeName}
                  onChange={(e) => updateRow(item.id, "feeName", e.target.value)}
                  placeholder="Fee name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                />
                <input
                  type="number"
                  min={0}
                  value={item.amount}
                  onChange={(e) => updateRow(item.id, "amount", e.target.value)}
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
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Total Amount</p>
                <p className="text-2xl font-black text-[#0F2942]">PHP {totalAmount.toLocaleString()}</p>
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
      </div>
    </div>
  );
}
