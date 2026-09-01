import {
  getInspectionProcessApi,
  getOfficerByIdApi,
  updateOfficerRoleApi,
} from "@/api/super_admin/super_admin.api";
import deleteAnimation from "@/assets/Delete.lottie?url";
import StatusModal from "@/components/feedback/StatusModal";
import OfficersHeader from "@/components/super_admin/officers/OfficersHeader";
import OfficerRoleTabs from "@/components/super_admin/officers/OfficerRoleTabs";
import OfficersResultsPanel from "@/components/super_admin/officers/OfficersResultsPanel";
import { LazyModalFallback } from "@/components/ui/LazyFallback";
import {
  getApiErrorMessage,
  getPaginationItems,
  initialOfficerFormData,
  ITEMS_PER_PAGE,
  requiresDepartmentRole,
  sortDepartmentsBySequence,
  type NewOfficerData,
  type OfficerFormState,
  type RoleTab,
} from "@/components/super_admin/officers/shared";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useOfficerStore } from "@/stores/officer/officer.store";
import type { OfficerType } from "@/types/officer/officer.type";
import type { InspectionDepartmentType } from "@/types/process/process.type";
import { matchesOfficerRoleTab } from "@/utils/super_admin/officer-role-filter.util";
import {
  lazy,
  Suspense,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

const AddOfficerModal = lazy(
  () => import("@/components/super_admin/officers/AddOfficerModal"),
);
const EditOfficerModal = lazy(
  () => import("@/components/super_admin/officers/EditOfficerModal"),
);
const DeleteOfficerModal = lazy(
  () => import("@/components/super_admin/officers/DeleteOfficerModal"),
);
const OfficerCredentialsModal = lazy(
  () => import("@/components/super_admin/officers/OfficerCredentialsModal"),
);

const modalFallback = (
  <LazyModalFallback
    title="Loading officer action"
    description="Preparing the selected officer dialog."
    compact
    maxWidthClassName="max-w-lg"
  />
);

export default function OfficersPage() {
  const user = useAuthStore((state) => state.user);
  const {
    officers,
    loading: isLoading,
    error,
    fetchOfficers,
    createOfficer,
    deleteOfficer,
    setOfficers,
    clearError,
  } = useOfficerStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<RoleTab>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerType | null>(
    null,
  );
  const [editingOfficerId, setEditingOfficerId] = useState("");
  const [editingOfficerOriginalRole, setEditingOfficerOriginalRole] =
    useState("");
  const [newOfficerData, setNewOfficerData] = useState<NewOfficerData | null>(
    null,
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isUpdatingOfficer, setIsUpdatingOfficer] = useState(false);
  const [isDeletingOfficer, setIsDeletingOfficer] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalType, setStatusModalType] = useState<"success" | "error">(
    "success",
  );
  const [statusModalTitle, setStatusModalTitle] = useState("");
  const [statusModalMessage, setStatusModalMessage] = useState("");
  const [departments, setDepartments] = useState<InspectionDepartmentType[]>([]);
  const [isDepartmentLoading, setIsDepartmentLoading] = useState(false);
  const [formData, setFormData] = useState<OfficerFormState>(
    initialOfficerFormData,
  );
  const [editFormData, setEditFormData] = useState<OfficerFormState>(
    initialOfficerFormData,
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void fetchOfficers();
  }, [fetchOfficers]);

  useEffect(() => {
    const loadDepartments = async () => {
      setIsDepartmentLoading(true);
      try {
        // Officer forms rely on process department order for scoped roles.
        const response = await getInspectionProcessApi();
        setDepartments(sortDepartmentsBySequence(response.data?.departments ?? []));
      } catch (err) {
        console.error("Failed to load inspection departments:", err);
        setDepartments([]);
      } finally {
        setIsDepartmentLoading(false);
      }
    };

    void loadDepartments();
  }, []);

  const generateDefaultPassword = (role: string): string => {
    // Temporary credential shown once in success modal after account creation.
    const randomNumbers = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    return `${role}@${randomNumbers}`;
  };

  const resetAddForm = () => {
    setFormData(initialOfficerFormData);
  };

  const resetEditForm = () => {
    setEditFormData(initialOfficerFormData);
    setEditingOfficerId("");
    setEditingOfficerOriginalRole("");
  };

  const currentUserId = user?._id ?? "";

  const canEditOfficer = (officer: OfficerType) => {
    const normalizedRole = String(officer.role ?? "").toLowerCase();
    return normalizedRole !== "super_admin" && officer._id !== currentUserId;
  };

  const getEditOfficerTitle = (officer: OfficerType) => {
    if (officer._id === currentUserId) {
      return "You cannot edit your own account role";
    }

    if (String(officer.role ?? "").toLowerCase() === "super_admin") {
      return "Super admin accounts cannot be edited here";
    }

    return "Edit Officer";
  };

  const canDeleteOfficer = (officer: OfficerType) => {
    const normalizedRole = String(officer.role ?? "").toLowerCase();
    return normalizedRole !== "super_admin" && officer._id !== currentUserId;
  };

  const getDeleteOfficerTitle = (officer: OfficerType) => {
    if (officer._id === currentUserId) {
      return "You cannot delete your own account";
    }

    if (String(officer.role ?? "").toLowerCase() === "super_admin") {
      return "Super admin accounts cannot be deleted";
    }

    return "Delete Officer";
  };

  const showErrorModal = (title: string, message: string) => {
    setStatusModalType("error");
    setStatusModalTitle(title);
    setStatusModalMessage(message);
    setShowStatusModal(true);
  };

  const handleAddFormChange = (
    field: keyof OfficerFormState,
    value: string,
  ) => {
    setFormData((prev) => {
      if (field !== "role") {
        return { ...prev, [field]: value };
      }

      return {
        ...prev,
        role: value,
        departmentId: requiresDepartmentRole(value) ? prev.departmentId : "",
      };
    });
  };

  const handleEditFormChange = (
    field: keyof OfficerFormState,
    value: string,
  ) => {
    setEditFormData((prev) => {
      if (field !== "role") {
        return { ...prev, [field]: value };
      }

      return {
        ...prev,
        role: value,
        departmentId: requiresDepartmentRole(value) ? prev.departmentId : "",
      };
    });
  };

  const handleAddOfficer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (requiresDepartmentRole(formData.role) && !formData.departmentId) {
      showErrorModal(
        "Department Required",
        "Please select a department for the selected role.",
      );
      return;
    }

    setIsSubmitting(true);

    const defaultPassword = generateDefaultPassword(formData.role);
    const success = await createOfficer({
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      suffix: formData.suffix,
      gender: formData.gender,
      email: formData.email,
      password: defaultPassword,
      role: formData.role,
      departmentId: requiresDepartmentRole(formData.role)
        ? formData.departmentId
        : "",
    });

    setIsSubmitting(false);

    if (success) {
      // Preserve generated credentials so admin can copy before dismissing modal.
      setNewOfficerData({
        email: formData.email,
        password: defaultPassword,
      });
      setShowSuccessModal(true);
      resetAddForm();
      setShowAddModal(false);
      return;
    }

    showErrorModal(
      "Failed to Create Officer",
      useOfficerStore.getState().error ||
        "An error occurred while creating the officer.",
    );
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 2000);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setIsEditLoading(false);
    setIsUpdatingOfficer(false);
    resetEditForm();
    clearError();
  };

  const openEditModal = async (officer: OfficerType) => {
    if (!canEditOfficer(officer)) {
      return;
    }

    setShowEditModal(true);
    setIsEditLoading(true);
    clearError();

    try {
      const response = await getOfficerByIdApi(officer._id);
      const data = response.data;

      setEditingOfficerId(data._id);
      setEditingOfficerOriginalRole(data.role ?? "");
      setEditFormData({
        firstName: data.firstName ?? "",
        middleName: data.middleName ?? "",
        lastName: data.lastName ?? "",
        suffix: data.suffix ?? "",
        gender: data.gender ?? "",
        email: data.email ?? "",
        role: data.role ?? "bplo_admin",
        departmentId: data.departmentId ?? "",
      });
    } catch (err) {
      closeEditModal();
      showErrorModal(
        "Failed to Load Officer",
        getApiErrorMessage(
          err,
          "Unable to load the selected officer details. Please try again.",
        ),
      );
    } finally {
      setIsEditLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedOfficer(null);
    setIsDeletingOfficer(false);
    clearError();
  };

  const openDeleteModal = (officer: OfficerType) => {
    if (!canDeleteOfficer(officer)) {
      return;
    }

    setSelectedOfficer(officer);
    setShowDeleteModal(true);
    clearError();
  };

  const handleDeleteOfficer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedOfficer) return;

    setIsDeletingOfficer(true);

    const success = await deleteOfficer(selectedOfficer._id);

    if (success) {
      closeDeleteModal();
      setShowDeleteSuccessModal(true);
      return;
    }

    setIsDeletingOfficer(false);
    showErrorModal(
      "Failed to Delete Officer",
      useOfficerStore.getState().error ||
        "An error occurred while deleting the officer.",
    );
  };

  const handleEditOfficer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingOfficerId) return;

    if (
      requiresDepartmentRole(editFormData.role) &&
      !editFormData.departmentId
    ) {
      showErrorModal(
        "Department Required",
        "Please select a department for the selected role.",
      );
      return;
    }

    setIsUpdatingOfficer(true);

    try {
      const response = await updateOfficerRoleApi(editingOfficerId, {
        role: editFormData.role,
        departmentId: requiresDepartmentRole(editFormData.role)
          ? editFormData.departmentId
          : "",
      });

      const currentOfficers = useOfficerStore.getState().officers;
      setOfficers(
        currentOfficers.map((officer) =>
          officer._id === editingOfficerId ? response.data : officer,
        ),
      );
      closeEditModal();
      setShowEditSuccessModal(true);
    } catch (err) {
      setIsUpdatingOfficer(false);
      showErrorModal(
        "Failed to Update Officer",
        getApiErrorMessage(
          err,
          "An error occurred while updating the officer role.",
        ),
      );
    }
  };

  const filteredOfficers = useMemo(
    () =>
      officers.filter((officer) => {
        const fullName =
          `${officer.firstName} ${officer.lastName}`.toLowerCase();
        const loweredSearch = searchTerm.toLowerCase();
        const matchesSearch =
          fullName.includes(loweredSearch) ||
          officer.email.toLowerCase().includes(loweredSearch);

        const matchesRole = matchesOfficerRoleTab(officer.role, activeTab);

        return matchesSearch && matchesRole;
      }),
    [activeTab, officers, searchTerm],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredOfficers.length / ITEMS_PER_PAGE)),
    [filteredOfficers.length],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedOfficers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOfficers.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredOfficers]);

  const pageStart =
    filteredOfficers.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredOfficers.length,
  );
  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const isDepartmentScopedRole = requiresDepartmentRole(formData.role);
  const isEditDepartmentScopedRole = requiresDepartmentRole(editFormData.role);

  return (
    <div className="flex min-h-screen flex-col gap-4 p-2 sm:gap-6 md:overflow-hidden md:p-6">
      <StatusModal
        isOpen={showEditSuccessModal}
        type="success"
        title="Officer Updated"
        message="The selected officer role has been updated."
        autoCloseMs={2000}
        onClose={() => setShowEditSuccessModal(false)}
      />

      <StatusModal
        isOpen={showDeleteSuccessModal}
        type="success"
        title="Officer Deleted"
        message="The selected officer account has been deleted."
        successAnimationSrc={deleteAnimation}
        autoCloseMs={2000}
        onClose={() => setShowDeleteSuccessModal(false)}
      />

      <OfficersHeader onOpenAddModal={() => setShowAddModal(true)} />

      <OfficerRoleTabs activeTab={activeTab} onChange={setActiveTab} />

      {showAddModal && (
        <Suspense fallback={modalFallback}>
          <AddOfficerModal
            formData={formData}
            isSubmitting={isSubmitting}
            isDepartmentLoading={isDepartmentLoading}
            isDepartmentScopedRole={isDepartmentScopedRole}
            departments={departments}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddOfficer}
            onFormChange={handleAddFormChange}
          />
        </Suspense>
      )}

      {showEditModal && (
        <Suspense fallback={modalFallback}>
          <EditOfficerModal
            editFormData={editFormData}
            editingOfficerOriginalRole={editingOfficerOriginalRole}
            isEditLoading={isEditLoading}
            isUpdatingOfficer={isUpdatingOfficer}
            isDepartmentLoading={isDepartmentLoading}
            isEditDepartmentScopedRole={isEditDepartmentScopedRole}
            departments={departments}
            onClose={closeEditModal}
            onSubmit={handleEditOfficer}
            onFormChange={handleEditFormChange}
          />
        </Suspense>
      )}

      {showDeleteModal && selectedOfficer && (
        <Suspense fallback={modalFallback}>
          <DeleteOfficerModal
            officer={selectedOfficer}
            isDeletingOfficer={isDeletingOfficer}
            onClose={closeDeleteModal}
            onSubmit={handleDeleteOfficer}
          />
        </Suspense>
      )}

      <OfficersResultsPanel
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        isLoading={isLoading}
        error={error}
        officersCount={officers.length}
        filteredOfficers={filteredOfficers}
        paginatedOfficers={paginatedOfficers}
        activeTab={activeTab}
        currentPage={currentPage}
        totalPages={totalPages}
        pageStart={pageStart}
        pageEnd={pageEnd}
        paginationItems={paginationItems}
        onRetry={() => window.location.reload()}
        onOpenEdit={openEditModal}
        onOpenDelete={openDeleteModal}
        canEditOfficer={canEditOfficer}
        canDeleteOfficer={canDeleteOfficer}
        getEditOfficerTitle={getEditOfficerTitle}
        getDeleteOfficerTitle={getDeleteOfficerTitle}
        onPreviousPage={() =>
          setCurrentPage((prev) => Math.max(prev - 1, 1))
        }
        onNextPage={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
        }
        onSelectPage={setCurrentPage}
      />

      {showSuccessModal && newOfficerData && (
        <Suspense fallback={modalFallback}>
          <OfficerCredentialsModal
            data={newOfficerData}
            copiedField={copiedField}
            onCopy={handleCopyToClipboard}
            onClose={() => {
              setShowSuccessModal(false);
              setNewOfficerData(null);
              setCopiedField(null);
            }}
          />
        </Suspense>
      )}

      <StatusModal
        isOpen={showStatusModal}
        type={statusModalType}
        title={statusModalTitle}
        message={statusModalMessage}
        onClose={() => {
          setShowStatusModal(false);
          clearError();
        }}
      />
    </div>
  );
}
