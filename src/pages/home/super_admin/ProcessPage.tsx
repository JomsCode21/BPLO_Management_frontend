import {
  getInspectionProcessApi,
  saveInspectionProcessApi,
} from "@/api/super_admin/super_admin.api";
import savedAnimation from "@/assets/Saved.lottie?url";
import StatusModal from "@/components/feedback/StatusModal";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import type { InspectionDepartmentType } from "@/types/process/process.type";
import { useEffect, useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const normalizeSequence = (departments: InspectionDepartmentType[]) =>
  // Keep sequence canonical after add/remove/reorder operations.
  departments.map((department, index) => ({
    ...department,
    sequence: index + 1,
  }));

const buildDepartmentId = (name: string, index: number) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || `department_${Date.now()}_${index + 1}`;
};

type ApiError = { response?: { data?: { message?: string } } };

export default function ProcessPage() {
  const [departments, setDepartments] = useState<InspectionDepartmentType[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const loadProcess = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getInspectionProcessApi();
      const ordered = [...(response.data?.departments ?? [])].sort(
        (a, b) => a.sequence - b.sequence,
      );
      setDepartments(normalizeSequence(ordered));
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(
        error?.response?.data?.message || "Failed to load inspection process.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProcess();
  }, []);

  const addDepartment = () => {
    const name = newDepartmentName.trim();
    if (!name) {
      setError("Department name is required.");
      return;
    }

    const exists = departments.some(
      (department) => department.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      setError("Department already exists.");
      return;
    }

    setDepartments((prev) =>
      normalizeSequence([
        ...prev,
        {
          id: buildDepartmentId(name, prev.length),
          name,
          sequence: prev.length + 1,
        },
      ]),
    );

    setShowAddModal(false);
    setNewDepartmentName("");
    setError(null);
  };

  const removeDepartment = (departmentId: string) => {
    setDepartments((prev) =>
      normalizeSequence(
        prev.filter((department) => department.id !== departmentId),
      ),
    );
    if (editingId === departmentId) {
      setEditingId(null);
      setEditingName("");
    }
    setError(null);
  };

  const moveDepartment = (index: number, direction: "up" | "down") => {
    setDepartments((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;

      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      // Reassign contiguous sequence numbers after moving.
      return normalizeSequence(next);
    });
    setError(null);
  };

  const startEdit = (department: InspectionDepartmentType) => {
    setEditingId(department.id);
    setEditingName(department.name);
  };

  const saveEdit = (departmentId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setError("Department name is required.");
      return;
    }

    const duplicate = departments.some(
      (department) =>
        department.id !== departmentId &&
        department.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (duplicate) {
      setError("Department already exists.");
      return;
    }

    setDepartments((prev) =>
      prev.map((department) =>
        department.id === departmentId
          ? { ...department, name: trimmed }
          : department,
      ),
    );
    setEditingId(null);
    setEditingName("");
    setError(null);
  };

  const saveProcess = async () => {
    const invalid = departments.some((department) => !department.name.trim());
    if (invalid) {
      setError("All departments must have valid names.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = normalizeSequence(
        // Ensure every department has a stable id and trimmed name before submit.
        departments.map((department, index) => ({
          ...department,
          id: department.id || buildDepartmentId(department.name, index),
          name: department.name.trim(),
        })),
      );

      const response = await saveInspectionProcessApi(payload);
      const ordered = [...(response.data?.departments ?? [])].sort(
        (a, b) => a.sequence - b.sequence,
      );
      setDepartments(normalizeSequence(ordered));
      setShowSaveSuccessModal(true);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(
        error?.response?.data?.message || "Failed to save inspection process.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 flex flex-col gap-4 pb-24 sm:gap-6 md:pb-0">
      <StatusModal
        isOpen={showSaveSuccessModal}
        type="success"
        title="Saved Successfully"
        message="Inspection process has been saved."
        successAnimationSrc={savedAnimation}
        autoCloseMs={2000}
        onClose={() => setShowSaveSuccessModal(false)}
      />

      <div data-super-admin-tour="process-header">
        <h2 className="text-2xl md:text-3xl font-black text-[#0F2942] tracking-wide">
          Process
        </h2>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Manage the default inspection workflow and its step order.
        </p>
      </div>

      {error && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${"border-red-200 bg-red-50 text-red-700"}`}
        >
          {error}
        </div>
      )}

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-black text-[#0F2942]">
              Inspection Process
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-4 py-2.5 text-sm font-bold text-white sm:w-auto"
            >
              <FiPlus />
              Add Department
            </button>
          </div>

          {departments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
              No departments yet. Add departments to start defining inspection
              steps.
            </div>
          ) : (
            <div className="space-y-3">
              {departments.map((department, index) => (
                <div
                  key={department.id}
                  className="rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0F2942]/10 text-[#0F2942] flex items-center justify-center font-black shrink-0">
                    {department.sequence}
                  </div>

                  <div className="flex-1">
                    {editingId === department.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    ) : (
                      <p className="font-bold text-[#0F2942]">
                        {department.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Step {department.sequence}
                    </p>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
                    <button
                      type="button"
                      onClick={() => moveDepartment(index, "up")}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 cursor-pointer"
                      title="Move up"
                    >
                      <FiArrowUp />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDepartment(index, "down")}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 cursor-pointer"
                      title="Move down"
                    >
                      <FiArrowDown />
                    </button>
                    {editingId === department.id ? (
                      <button
                        type="button"
                        onClick={() => saveEdit(department.id)}
                        className="px-3 py-2 rounded-lg bg-[#0F2942] text-white text-sm font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(department)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-600 cursor-pointer"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDepartment(department.id)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={saveProcess}
              disabled={isLoading || isSaving}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <FiSave />
              {isSaving ? "Saving..." : "Save Inspection Process"}
            </button>
          </div>
      </section>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="p-6 md:p-8">
              <div className="mb-5 flex items-start justify-between gap-3">
                <h3 className="text-xl font-black text-[#0F2942]">
                  Add Department
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={newDepartmentName}
                    onChange={(e) => setNewDepartmentName(e.target.value)}
                    placeholder="e.g. Fire Department"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addDepartment}
                    className="flex-1 px-5 py-3 bg-[#0F2942] text-white rounded-xl font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
