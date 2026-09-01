import type { StatCard } from "./shared";

type UserDashboardStatsGridProps = {
  statCards: StatCard[];
};

export default function UserDashboardStatsGrid({
  statCards,
}: UserDashboardStatsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className={`rounded-[1.75rem] border border-gray-100 p-4 shadow-sm ${card.surfaceClass}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
                  {card.label}
                </p>
                <p className="mt-3 text-[1.9rem] font-black leading-none text-[#0F2942]">
                  {card.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${card.iconClass}`}
              >
                <Icon className="text-lg" />
              </div>
            </div>

            <p className="mt-3 text-sm font-medium leading-6 text-gray-500">
              {card.note}
            </p>
          </article>
        );
      })}
    </section>
  );
}
