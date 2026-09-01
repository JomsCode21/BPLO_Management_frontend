import { FiLoader, FiTrash2, FiX } from "react-icons/fi";

type PermitTemplateDeleteModalProps = {
  permitName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function PermitTemplateDeleteModal({
  permitName,
  isDeleting,
  onClose,
  onConfirm,
}: PermitTemplateDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-[#0F2942]">Delete Template</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
          >
            <FiX />
          </button>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-600">
          Delete template for{" "}
          <span className="font-bold text-[#0F2942]">{permitName}</span>? This
          action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiTrash2 />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
