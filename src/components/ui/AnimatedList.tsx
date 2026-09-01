import { motion, useInView } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
  type UIEvent,
} from "react";

type AnimatedItemProps = {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

const AnimatedItem = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}: AnimatedItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ y: 18, opacity: 0, scale: 0.97 }}
      animate={inView ? { y: 0, opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.2, delay }}
      className="mb-3 cursor-pointer touch-pan-y last:mb-0"
      style={{ touchAction: "pan-y" }}
    >
      {children}
    </motion.div>
  );
};

export type AnimatedListProps<T> = {
  items: T[];
  onItemSelect?: (item: T, index: number) => void;
  renderItem?: (item: T, index: number, isSelected: boolean) => ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  getItemLabel?: (item: T, index: number) => string;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  useInternalScroll?: boolean;
  className?: string;
  itemClassName?: string;
  listClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  emptyState?: ReactNode;
};

export default function AnimatedList<T>({
  items,
  onItemSelect,
  renderItem,
  getItemKey,
  getItemLabel,
  showGradients = true,
  enableArrowNavigation = true,
  useInternalScroll = true,
  className = "",
  itemClassName = "",
  listClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
  emptyState = null,
}: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] =
    useState<number>(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (item: T, index: number) => {
      setSelectedIndex(index);
      onItemSelect?.(item, index);
    },
    [onItemSelect],
  );

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } =
      event.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));

    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );
  };

  useEffect(() => {
    if (!enableArrowNavigation || items.length === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowDown" ||
        (event.key === "Tab" && !event.shiftKey)
      ) {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((previous) =>
          Math.min(Math.max(previous, -1) + 1, items.length - 1),
        );
        return;
      }

      if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((previous) => Math.max(previous - 1, 0));
        return;
      }

      if (
        event.key === "Enter" &&
        selectedIndex >= 0 &&
        selectedIndex < items.length
      ) {
        event.preventDefault();
        onItemSelect?.(items[selectedIndex], selectedIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableArrowNavigation, items, onItemSelect, selectedIndex]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;

    const container = listRef.current;
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`,
    ) as HTMLElement | null;

    if (selectedItem) {
      const extraMargin = 36;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;

      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({
          top: itemTop - extraMargin,
          behavior: "smooth",
        });
      } else if (
        itemBottom >
        containerScrollTop + containerHeight - extraMargin
      ) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: "smooth",
        });
      }
    }
  }, [keyboardNav, selectedIndex]);

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className={`${
          useInternalScroll
            ? "max-h-100 overflow-y-auto overscroll-contain touch-pan-y"
            : "overflow-visible"
        } ${
          displayScrollbar
            ? "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-slate-300"
            : "scrollbar-hide"
        } ${listClassName}`}
        onScroll={handleScroll}
        style={{
          WebkitOverflowScrolling: useInternalScroll ? "touch" : undefined,
          touchAction: useInternalScroll ? "pan-y" : undefined,
          scrollbarWidth: displayScrollbar ? "thin" : "none",
          scrollbarColor: displayScrollbar ? "#cbd5e1 transparent" : undefined,
        }}
      >
        {items.length === 0
          ? emptyState
          : items.map((item, index) => {
              const isSelected = selectedIndex === index;
              const label = getItemLabel
                ? getItemLabel(item, index)
                : String(item);

              return (
                <AnimatedItem
                  key={String(getItemKey ? getItemKey(item, index) : label)}
                  delay={0.04 * index}
                  index={index}
                  onMouseEnter={() => handleItemMouseEnter(index)}
                  onClick={() => handleItemClick(item, index)}
                >
                  {renderItem ? (
                    renderItem(item, index, isSelected)
                  ) : (
                    <div
                      className={`rounded-lg bg-[#111827] p-4 text-white ${
                        isSelected ? "bg-[#1f2937]" : ""
                      } ${itemClassName}`}
                    >
                      <p className="m-0">{label}</p>
                    </div>
                  )}
                </AnimatedItem>
              );
            })}
      </div>

      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute left-0 right-0 top-0 h-10 bg-linear-to-b from-white to-transparent transition-opacity duration-300 ease"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-linear-to-t from-white to-transparent transition-opacity duration-300 ease"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
}
