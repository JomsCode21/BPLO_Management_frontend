import { FiPlus } from "react-icons/fi";

type OfficersHeaderProps = {
  onOpenAddModal: () => void;
};

export default function OfficersHeader({
  onOpenAddModal,
}: OfficersHeaderProps) {
  return (
    <div
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      data-super-admin-tour="officers-header"
    >
      <div>
        <h2 className="text-2xl font-black tracking-wide text-[#0F2942] md:text-3xl">
          Officers Management
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Manage system administrators, evaluators, inspectors, and treasurers.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenAddModal}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0F2942] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1E3A56] hover:shadow-lg active:scale-95 sm:w-auto"
      >
        <FiPlus className="text-xl" />
        Add Officer
      </button>
    </div>
  );
}
