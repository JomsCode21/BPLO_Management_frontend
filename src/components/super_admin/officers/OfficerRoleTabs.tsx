import type { RoleTab } from "./shared";
import { officerRoleTabs } from "./shared";

type OfficerRoleTabsProps = {
  activeTab: RoleTab;
  onChange: (tab: RoleTab) => void;
};

export default function OfficerRoleTabs({
  activeTab,
  onChange,
}: OfficerRoleTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 sm:overflow-x-auto sm:scrollbar-hide sm:pb-1">
      {officerRoleTabs.map((tab) => (
        <button
          type="button"
          key={tab.value}
          aria-pressed={activeTab === tab.value}
          onClick={() => onChange(tab.value)}
          className={`no-login-theme w-full cursor-pointer whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition-all sm:w-auto sm:px-5 ${
            activeTab === tab.value
              ? "border border-[#F2C94C] bg-[#F2C94C] text-[#0F2942] shadow-[0_10px_24px_rgba(242,201,76,0.28)]"
              : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-[#0F2942]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
