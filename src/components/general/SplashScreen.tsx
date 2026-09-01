import { useBrandingStore } from "@/stores/branding/branding.store";
import { motion } from "framer-motion";
import { useEffect } from "react";
import BPLOLogo from "../../assets/BPLOLogo.png";

type SplashScreenProps = {
  isExiting?: boolean;
};

const INTRO_DURATION = 4.15;
const CARD_DELAY = 2.55;
const ENTER_EASE = [0.22, 1, 0.36, 1] as const;
const EXIT_EASE = [0.4, 0, 0.2, 1] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.12,
      delay: CARD_DELAY,
      ease: ENTER_EASE,
      staggerChildren: 0.16,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -18,
    scale: 0.96,
    transition: {
      duration: 0.45,
      ease: EXIT_EASE,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 88,
      damping: 13,
    },
  },
  exit: {
    y: -8,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: EXIT_EASE,
    },
  },
};

export default function SplashScreen({
  isExiting = false,
}: SplashScreenProps) {
  const logoUrl = useBrandingStore((s) => s.logoUrl);
  const fetchLogo = useBrandingStore((s) => s.fetchLogo);

  useEffect(() => {
    void fetchLogo();
  }, [fetchLogo]);

  const activeLogo = logoUrl || BPLOLogo;

  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full overflow-hidden bg-white px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{
          duration: isExiting ? 0.42 : 0.32,
          delay: isExiting ? 0.38 : 0,
          ease: isExiting ? EXIT_EASE : ENTER_EASE,
        }}
        className="absolute inset-0 bg-white"
      />

      <motion.div
        initial={{ y: "100%", scale: 1, borderRadius: "100%" }}
        animate={
          isExiting
            ? {
                scale: 26,
                y: "-18%",
                borderRadius: "40%",
              }
            : {
                y: "0%",
                scale: 1,
                borderRadius: "100%",
              }
        }
        transition={
          isExiting
            ? {
                duration: 1.05,
                ease: EXIT_EASE,
              }
            : {
                type: "spring",
                stiffness: 36,
                damping: 15,
                mass: 1.22,
                delay: 0.18,
              }
        }
        className="absolute bottom-[-15%] left-[-10%] z-0 h-[50%] w-[120%] bg-[#0F2942] md:bottom-[-20%] md:left-[-20%] md:h-[70%] md:w-[140%]"
        style={{ transform: "rotate(-2deg)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.94 }}
        animate={
          isExiting
            ? {
                opacity: 0,
                y: -10,
                scale: 0.98,
              }
            : {
                opacity: [0, 1, 1, 0],
                y: [20, 0, 0, -10],
                scale: [0.94, 1, 1, 0.98],
              }
        }
        transition={
          isExiting
            ? {
                duration: 0.2,
                ease: EXIT_EASE,
              }
            : {
                duration: INTRO_DURATION,
                times: [0, 0.18, 0.7, 1],
                ease: ENTER_EASE,
              }
        }
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      >
        <div className="flex flex-col items-center text-center">
          <motion.img
            src={activeLogo}
            alt="BPLO Logo"
            animate={
              isExiting
                ? { y: 0 }
                : { y: [0, -6, 0] }
            }
            transition={{
              duration: 4,
              repeat: isExiting ? 0 : Infinity,
              ease: "easeInOut",
            }}
            className="h-auto w-full max-w-52 object-contain md:max-w-xs"
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={
              isExiting
                ? {
                    opacity: 0,
                    y: -4,
                  }
                : {
                    opacity: [0, 0, 1, 1, 0],
                    y: [12, 12, 0, 0, -6],
                  }
            }
            transition={
              isExiting
                ? {
                    duration: 0.2,
                    ease: EXIT_EASE,
                  }
                : {
                    duration: INTRO_DURATION,
                    times: [0, 0.18, 0.36, 0.7, 1],
                    ease: ENTER_EASE,
                  }
            }
            className="mt-4"
          >
            <h1 className="text-2xl font-black leading-tight text-[#0F2942]">
              Loading
            </h1>
            <p className="mt-2 text-sm font-semibold text-gray-500">
              Checking your session
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="relative z-20 flex min-h-screen items-center justify-center py-6">
        <div className="w-full max-w-105">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isExiting ? "exit" : "visible"}
            className="rounded-[35px] border border-gray-50 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:rounded-[45px] md:p-10"
          >
            <motion.div
              variants={itemVariants}
              className="mb-8 flex justify-center"
            >
              <img
                src={activeLogo}
                alt="BPLO Logo"
                className="h-auto w-full max-w-xs object-contain"
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mb-8 text-center"
            >
              <h1 className="text-2xl font-black leading-tight text-[#0F2942] md:text-[32px]">
                Loading
                <motion.span
                  animate={
                    isExiting ? { opacity: 0 } : { opacity: [0, 1, 0] }
                  }
                  transition={{
                    repeat: isExiting ? 0 : Infinity,
                    duration: 1.55,
                    ease: "linear",
                  }}
                >
                  ...
                </motion.span>
              </h1>
              <p className="mt-2 text-sm font-semibold text-gray-500">
                Online Business Permit System
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mb-8 text-center"
            >
              <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600 md:text-base">
                Restoring your secure BPLO session and preparing your workspace
                with the same smooth flow as the landing page.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center"
            >
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#E9ECEF]">
                <motion.div
                  className="h-full w-20 rounded-full bg-[#F2C94C]"
                  animate={
                    isExiting ? { x: 0 } : { x: ["-35%", "115%"] }
                  }
                  transition={{
                    duration: 2,
                    repeat: isExiting ? 0 : Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <p className="mt-4 text-sm font-bold text-gray-400">
                Checking your session
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
