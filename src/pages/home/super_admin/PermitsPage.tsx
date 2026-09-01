import {
  createPermitApi,
  deletePermitApi,
  getAllPermitsApi,
  updatePermitValiditySettingsApi,
} from "@/api/super_admin/super_admin.api";
import deleteAnimation from "@/assets/Delete.lottie?url";
import StatusModal from "@/components/feedback/StatusModal";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import type { PermitType } from "@/types/permit/permit.type";
import { useEffect, useMemo, useState } from "react";
import {
  FiCheckSquare,
  FiEdit2,
  FiEye,
  FiPlus,
  FiSquare,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

type ApiError = { response?: { data?: { message?: string } } };
const ITEMS_PER_PAGE = 15;

export default function PermitsPage() {
  const navigate = useNavigate();

  const [permits, setPermits] = useState<PermitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showValiditySettingsModal, setShowValiditySettingsModal] =
    useState(false);
  const [selectedPermitForSettings, setSelectedPermitForSettings] =
    useState<PermitType | null>(null);
  const [isSavingValiditySettings, setIsSavingValiditySettings] =
    useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [selectedPermitId, setSelectedPermitId] = useState("");
  const [validitySettingsForm, setValiditySettingsForm] = useState({
    showInPermitValidity: true,
    permitValidityDisplayFieldIds: [] as string[],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const fetchPermits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllPermitsApi();
      // Source list for permit management and validity configuration.
      setPermits(response.data ?? []);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(
        error?.response?.data?.message ??
          "Failed to load permits. Please refresh and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPermits();
  }, []);

  const totalPages = Math.max(1, Math.ceil(permits.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedPermits = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return permits.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, permits]);

  const pageStart =
    permits.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, permits.length);

  const getPermitUpdatedLabel = (updatedAt?: string) =>
    updatedAt ? new Date(updatedAt).toLocaleDateString() : "-";

  const openValiditySettingsModal = (permit: PermitType) => {
    // Seed modal state from selected permit so edits are scoped and reversible.
    setSelectedPermitForSettings(permit);
    setValiditySettingsForm({
      showInPermitValidity: permit.showInPermitValidity !== false,
      permitValidityDisplayFieldIds: Array.isArray(
        permit.permitValidityDisplayFieldIds,
      )
        ? permit.permitValidityDisplayFieldIds
        : [],
    });
    setShowValiditySettingsModal(true);
    setError(null);
  };

  const togglePermitValidityDisplayField = (fieldId: string) => {
    setValiditySettingsForm((prev) => {
      const isSelected = prev.permitValidityDisplayFieldIds.includes(fieldId);
      return {
        ...prev,
        permitValidityDisplayFieldIds: isSelected
          ? prev.permitValidityDisplayFieldIds.filter((id) => id !== fieldId)
          : [...prev.permitValidityDisplayFieldIds, fieldId],
      };
    });
  };

  const handleSavePermitValiditySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermitForSettings) return;

    setIsSavingValiditySettings(true);
    setError(null);

    try {
      await updatePermitValiditySettingsApi(selectedPermitForSettings._id, {
        showInPermitValidity: validitySettingsForm.showInPermitValidity,
        enablePermitValidityFormDisplay:
          validitySettingsForm.showInPermitValidity,
        permitValidityDisplayFieldIds:
          validitySettingsForm.permitValidityDisplayFieldIds,
      });
      setShowValiditySettingsModal(false);
      setSelectedPermitForSettings(null);
      // Reload permit list to reflect latest validity settings in table/cards.
      await fetchPermits();
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError?.response?.data?.message ??
          "Failed to save permit validity settings. Please try again.",
      );
    } finally {
      setIsSavingValiditySettings(false);
    }
  };
  const handleCreatePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createPermitApi({
        name: formData.name,
        description: formData.description,
      });

      setShowCreateModal(false);
      setFormData({ name: "", description: "" });
      await fetchPermits();
      // Route straight to form builder so admin can configure sections/fields immediately.
      navigate(`/home/super_admin/permits/${response.data._id}`);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(
        error?.response?.data?.message ??
          "Failed to create permit. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermitId) {
      setError("Please select a permit to delete.");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deletePermitApi(selectedPermitId);
      setShowDeleteModal(false);
      setSelectedPermitId("");
      await fetchPermits();
      setShowDeleteSuccessModal(true);
    } catch (err: unknown) {
      const error = err as ApiError;
      setError(
        error?.response?.data?.message ??
          "Failed to delete permit. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 flex flex-col gap-4 pb-24 sm:gap-6 md:pb-0">
      <StatusModal
        isOpen={showDeleteSuccessModal}
        type="success"
        title="Deleted Successfully"
        message="The selected permit has been deleted."
        successAnimationSrc={deleteAnimation}
        autoCloseMs={2000}
        onClose={() => setShowDeleteSuccessModal(false)}
      />

      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        data-super-admin-tour="permits-header"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#0F2942] tracking-wide">
            Permit Management
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Create permit types and build their dynamic application forms.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0F2942] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1E3A56] hover:shadow-lg active:scale-95 sm:w-auto"
          >
            <FiPlus className="text-xl" />
            Add Permit
          </button>
          <button
            onClick={() => {
              setShowDeleteModal(true);
              setError(null);
            }}
            disabled={permits.length === 0}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <FiTrash2 className="text-xl" />
            Delete Permit
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="flex min-h-96 w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {permits.length === 0 ? (
          <div className="flex flex-col items-center justify-center grow py-20 text-gray-400">
            <p className="font-bold tracking-wide">No permits created yet.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 md:hidden">
              {paginatedPermits.map((permit) => (
                <article key={permit._id} className="space-y-4 p-4 sm:p-5">
                  <div>
                    <p className="font-bold text-[#0F2942]">{permit.name}</p>
                    {!!permit.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {permit.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        Fields
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {permit.fields?.length ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        Updated
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {getPermitUpdatedLabel(permit.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      onClick={() =>
                        navigate(`/home/super_admin/permits/${permit._id}`)
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0F2942] px-4 py-2.5 text-sm font-bold text-[#0F2942] transition-all hover:bg-[#0F2942] hover:text-white"
                    >
                      <FiEye />
                      Manage Form
                    </button>
                    <button
                      type="button"
                      onClick={() => openValiditySettingsModal(permit)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#F2C94C] bg-[#F2C94C] px-4 py-2.5 text-sm font-bold text-[#0F2942] transition-all hover:brightness-95"
                    >
                      <FiEdit2 />
                      Edit Validity
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-176 border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-white text-xs font-bold uppercase tracking-widest text-gray-400">
                    <th className="px-6 py-5">Permit Name</th>
                    <th className="px-6 py-5">Fields</th>
                    <th className="px-6 py-5">Last Updated</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedPermits.map((permit) => (
                    <tr
                      key={permit._id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#0F2942]">{permit.name}</p>
                        {!!permit.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {permit.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                        {permit.fields?.length ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">
                        {getPermitUpdatedLabel(permit.updatedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openValiditySettingsModal(permit)}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#F2C94C] bg-[#F2C94C] px-4 py-2 text-sm font-bold text-[#0F2942] transition-all hover:brightness-95"
                          >
                            <FiEdit2 />
                            Edit Validity
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/home/super_admin/permits/${permit._id}`)
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#0F2942] px-4 py-2 text-sm font-bold text-[#0F2942] transition-all hover:bg-[#0F2942] hover:text-white"
                          >
                            <FiEye />
                            Manage Form
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!isLoading && permits.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm font-medium text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span>
              Showing {pageStart}-{pageEnd} of {permits.length} permits
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-8 rounded-lg px-2 text-sm font-bold ${
                        isActive
                          ? "bg-[#0F2942] text-white"
                          : "border border-gray-200 text-[#0F2942]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showValiditySettingsModal && selectedPermitForSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="p-6 md:p-8">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-[#0F2942]">
                    Edit Validity Display
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {selectedPermitForSettings.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowValiditySettingsModal(false);
                    setSelectedPermitForSettings(null);
                  }}
                  className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleSavePermitValiditySettings} className="space-y-5">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <label className="inline-flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={validitySettingsForm.showInPermitValidity}
                      onChange={(event) =>
                        setValiditySettingsForm((prev) => ({
                          ...prev,
                          showInPermitValidity: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 accent-[#0F2942]"
                    />
                    <span>
                      <span className="block text-sm font-bold text-[#0F2942]">
                        Show this permit in BPLO Admin Permit Validity
                      </span>
                      <span className="mt-1 block text-xs font-medium text-gray-500">
                        This is the old "Shown in Validity" control, now inside Edit.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm font-bold text-[#0F2942]">
                    Select Form Fields to Display
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Choose which submitted permit fields will appear in BPLO Admin
                    Permit Validity when this permit is shown.
                  </p>

                  <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                    {selectedPermitForSettings.fields?.length ? (
                      selectedPermitForSettings.fields.map((field) => {
                        const isSelected =
                          validitySettingsForm.permitValidityDisplayFieldIds.includes(
                            field.id,
                          );

                        return (
                          <button
                            key={field.id}
                            type="button"
                            onClick={() => togglePermitValidityDisplayField(field.id)}
                            className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-left transition-all ${
                              isSelected
                                ? "border-[#0F2942] bg-[#0F2942]/5"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <span className="mt-0.5 text-[#0F2942]">
                              {isSelected ? <FiCheckSquare /> : <FiSquare />}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-bold text-[#0F2942]">
                                {field.label}
                              </span>
                              <span className="block text-xs font-medium text-gray-500">
                                {field.type}
                              </span>
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                        No form fields found for this permit yet. Build the permit form
                        first, then return here to select display fields.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setShowValiditySettingsModal(false);
                      setSelectedPermitForSettings(null);
                    }}
                    className="flex-1 cursor-pointer rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-600 transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingValiditySettings}
                    className="flex-1 cursor-pointer rounded-xl bg-[#0F2942] px-6 py-3 font-bold text-white transition-all hover:bg-[#1E3A56] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSavingValiditySettings ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full">
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-start justify-between gap-3">
                <h2 className="text-2xl font-black text-[#0F2942]">
                  Create Permit Type
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleCreatePermit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Permit Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Business Permit"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Permit details or guidance for this permit type."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-[#0F2942] text-white font-bold rounded-xl hover:bg-[#1E3A56] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? "Creating..." : "Create Permit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full">
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-start justify-between gap-3">
                <h2 className="text-2xl font-black text-red-700">
                  Delete Permit
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPermitId("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleDeletePermit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Select Permit to Delete *
                  </label>
                  <select
                    required
                    value={selectedPermitId}
                    onChange={(e) => setSelectedPermitId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="">Choose a permit</option>
                    {permits.map((permit) => (
                      <option key={permit._id} value={permit._id}>
                        {permit.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  This action will remove the selected permit from active
                  permits.
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedPermitId("");
                    }}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isDeleting ? "Deleting..." : "Delete Permit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}












