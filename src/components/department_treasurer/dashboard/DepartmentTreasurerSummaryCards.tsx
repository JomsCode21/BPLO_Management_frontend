import type { IconType } from "react-icons";

export type DepartmentTreasurerSummaryCard = {
  label: string;
  value: string;
  note: string;
  icon: IconType;
  surfaceClass: string;
  iconClass: string;
};

type Props = {
  items: DepartmentTreasurerSummaryCard[];
};

export default function DepartmentTreasurerSummaryCards({ items }: Props) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className={`min-h-32 rounded-3xl border border-gray-100 p-4 shadow-sm md:p-5 ${card.surfaceClass}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
                  {card.label}
                </p>
                <p className="mt-3 wrap-break-words text-[1.55rem] font-black leading-none text-[#0F2942] sm:text-[1.8rem]">
                  {card.value}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ${card.iconClass}`}
              >
                <Icon className="text-lg" />
              </div>
            </div>

            <p className="mt-3 text-sm font-medium text-gray-500">
              {card.note}
            </p>
          </article>
        );
      })}
    </section>
  );
}
