import type { NewOfficerData } from "./shared";

type OfficerCredentialsModalProps = {
  data: NewOfficerData;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  onClose: () => void;
};

export default function OfficerCredentialsModal({
  data,
  copiedField,
  onCopy,
  onClose,
}: OfficerCredentialsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-black text-[#0F2942]">
            Officer Created!
          </h2>
          <p className="mb-3 text-sm text-gray-500">
            The account has been created successfully.
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs font-bold text-blue-800">
              Credentials emailed to officer
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-600">
              Email
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                readOnly
                value={data.email}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-700"
              />
              <button
                type="button"
                onClick={() => onCopy(data.email, "email")}
                className="w-full rounded-xl bg-[#0F2942] px-4 py-3 font-bold text-white transition-all hover:bg-[#1E3A56] sm:w-auto"
              >
                {copiedField === "email" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-600">
              Temporary Password
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                readOnly
                value={data.password}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium text-gray-700"
              />
              <button
                type="button"
                onClick={() => onCopy(data.password, "password")}
                className="w-full rounded-xl bg-[#0F2942] px-4 py-3 font-bold text-white transition-all hover:bg-[#1E3A56] sm:w-auto"
              >
                {copiedField === "password" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs font-medium text-yellow-800">
              <span className="font-bold">Important:</span> The officer should
              change this password upon first login.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-800">
              <span className="font-bold">Email Sent:</span> These credentials
              have been automatically sent to the officer&apos;s email address.
              You can also copy them here for your records.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-[#0F2942] px-6 py-3 font-bold text-white transition-all hover:bg-[#1E3A56]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
