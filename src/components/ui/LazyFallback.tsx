import { cn } from "@/lib/utils";

import Skeleton from "@/components/ui/Skeleton";

type LazyModalFallbackProps = {
  title: string;
  description?: string;
  maxWidthClassName?: string;
  align?: "center" | "top";
  compact?: boolean;
  className?: string;
};

type LazyPanelFallbackProps = {
  title: string;
  description?: string;
  className?: string;
  cardCount?: number;
};

export function LazyModalFallback({
  title,
  description,
  maxWidthClassName,
  align = "center",
  compact = false,
  className,
}: LazyModalFallbackProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-center bg-black/40 p-4",
        align === "top" ? "items-start md:p-6" : "items-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "w-full rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-2xl backdrop-blur-sm md:p-6",
          compact ? "max-w-md" : "max-w-4xl",
          maxWidthClassName,
        )}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-full bg-slate-200" />
            <p className="text-lg font-black text-[#0F2942] md:text-xl">
              {title}
            </p>
            {description ? (
              <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
                {description}
              </p>
            ) : (
              <Skeleton className="h-4 w-full max-w-lg bg-slate-200" />
            )}
          </div>

          {compact ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-5/6 max-w-xs bg-slate-200" />
              <div className="flex justify-end">
                <Skeleton className="h-11 w-28 rounded-xl bg-slate-200" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <Skeleton className="h-24 w-full rounded-2xl bg-slate-100" />
                <Skeleton className="h-24 w-full rounded-2xl bg-slate-100" />
              </div>
              <Skeleton className="h-32 w-full rounded-3xl bg-slate-100" />
              <div className="flex flex-wrap justify-end gap-3">
                <Skeleton className="h-11 w-28 rounded-xl bg-slate-200" />
                <Skeleton className="h-11 w-32 rounded-xl bg-slate-200" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function LazyPanelFallback({
  title,
  description,
  className,
  cardCount = 3,
}: LazyPanelFallbackProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-gray-100 bg-white p-5 shadow-sm",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#235cff]">
            Loading
          </p>
          <h3 className="text-lg font-black text-[#0F2942]">{title}</h3>
          {description ? (
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
              {description}
            </p>
          ) : (
            <Skeleton className="h-4 w-full max-w-xl bg-slate-200" />
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: cardCount }).map((_, index) => (
            <Skeleton
              key={`${title}-${index}`}
              className="h-28 w-full rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
