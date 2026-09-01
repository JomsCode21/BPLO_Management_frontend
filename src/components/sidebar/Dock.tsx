import { motion } from "framer-motion";
import React from "react";

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
  tourTarget?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  style?: React.CSSProperties;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
};

export default function Dock({
  items,
  className = "",
  style,
}: DockProps) {
  return (
    <motion.nav
      initial={{ y: 16, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
      role="toolbar"
      aria-label="Application dock"
    >
      <div className="flex items-stretch gap-1.5">
        {items.map((item, index) => {
          const ariaLabel =
            typeof item.label === "string" ? item.label : `Navigation ${index + 1}`;

          return (
            <motion.button
              key={`${ariaLabel}-${index}`}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.04 * index,
                duration: 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden rounded-[1.15rem] px-2 py-2 text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                item.isActive ? "text-[#0F2942]" : "text-white/78"
              } ${item.className ?? ""}`}
              aria-label={ariaLabel}
              data-super-admin-tour={item.tourTarget}
            >
              {item.isActive && (
                <motion.span
                  layoutId="mobileDockActivePill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-[1.15rem] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                />
              )}

              <motion.span
                animate={
                  item.isActive
                    ? { y: -1, scale: 1.04 }
                    : { y: 0, scale: 1 }
                }
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl ${
                  item.isActive ? "bg-[#0F2942]/8" : "bg-white/8"
                }`}
              >
                {item.icon}
              </motion.span>
              <motion.span
                animate={item.isActive ? { y: 0, opacity: 1 } : { y: 0, opacity: 0.86 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative z-10 max-w-full truncate leading-none"
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
