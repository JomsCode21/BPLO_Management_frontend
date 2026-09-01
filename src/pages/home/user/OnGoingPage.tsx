import comingSoonAnimation from "@/assets/CommingSoon.lottie?url";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function OnGoingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gray-50 px-3 sm:px-4 lg:px-6 py-8 flex flex-col">
      <div className="w-full grow overflow-hidden rounded-3xl border border-[#D9DEE6] bg-white shadow-sm">
        <header className="bg-[#0F2942] px-7 py-8 sm:px-8 sm:py-10">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors cursor-pointer w-fit mb-4"
          >
            <FiArrowLeft className="text-lg" />
            <span className="text-sm font-bold">Back</span>
          </button>
          <h1 className="text-xl sm:text-3xl font-black uppercase tracking-wide text-white">
            On Going
          </h1>
          <p className="mt-2 text-white/80 text-base sm:text-lg max-w-3xl font-medium">
            This feature is currently in progress and will be available soon.
          </p>
        </header>

        <section className="bg-white px-6 py-8 sm:px-8 lg:px-10 h-full flex items-center justify-center">
          <div className="max-w-lg w-full rounded-3xl border border-gray-100 bg-gray-50/60 p-6 sm:p-8 text-center">
            <div className="w-full max-w-sm mx-auto">
              <DotLottieReact src={comingSoonAnimation} autoplay loop />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F2942] mt-2">
              Coming Soon
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              We are building this page right now. Please check back shortly.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
