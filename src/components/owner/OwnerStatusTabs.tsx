import { NavLink } from "react-router-dom";

const statusTabs = [
  {
    label: "Application",
    path: "/home/user/application-status",
  },
  {
    label: "Inspection",
    path: "/home/user/inspection-status",
  },
  {
    label: "Payment",
    path: "/home/user/payment-status",
  },
];

export default function OwnerStatusTabs() {
  return (
    <nav
      className="mb-4 rounded-2xl border border-[#D9E1EA] bg-[#F4F8FC] p-1.5"
      aria-label="Owner status tabs"
    >
      <div className="grid grid-cols-3 gap-1.5">
        {statusTabs.map((tab) => (
          <NavLink key={tab.path} to={tab.path} end>
            {({ isActive }) => (
              <span
                className={`inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.08em] transition-colors sm:text-sm ${
                  isActive
                    ? "bg-[#0F2942] text-[#F2C94C]"
                    : "bg-white text-[#0F2942]/72 hover:text-[#0F2942]"
                }`}
              >
                {tab.label}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
