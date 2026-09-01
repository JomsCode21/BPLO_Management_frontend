// Libraries
import { motion } from "framer-motion";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// Stores
import { useAuthStore } from "@/stores/auth/auth.store";

type LogoutBtnProps = {
  className?: string;
  labelClassName?: string;
  iconSize?: number;
  onLoggedOut?: () => void;
};

export default function LogoutBtn({
  className = "",
  labelClassName = "",
  iconSize = 20,
  onLoggedOut,
}: LogoutBtnProps) {
  const loading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);

  const navigate = useNavigate();

  const submitLogout = async () => {
    const success = await logout();
    if (success) {
      onLoggedOut?.();
      navigate("/auth/login", { replace: true });
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.03 }}
      disabled={loading}
      onClick={submitLogout}
      className={`inline-flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-transparent bg-[#F2C94C] px-4 py-3 text-sm font-bold text-[#0F2942] shadow-[0_10px_24px_rgba(242,201,76,0.28)] transition-all duration-200 hover:bg-[#e6bf43] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <FiLogOut size={iconSize} />
      <span
        className={`text-sm font-bold tracking-widest uppercase ${labelClassName}`}
      >
        Log out
      </span>
    </motion.button>
  );
}
