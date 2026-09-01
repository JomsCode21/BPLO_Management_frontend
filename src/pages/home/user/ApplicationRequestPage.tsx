import { getOwnerPermitsApi } from "@/api/owner/owner.api";
import AnimatedList from "@/components/ui/AnimatedList";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import type { PermitType } from "@/types/permit/permit.type";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiFileText,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const getPermitDescription = (permit: PermitType) =>
  permit.formDescription?.trim() ||
  permit.description?.trim() ||
  "Start your application for this permit type.";

export default function ApplicationRequestPage() {
  const navigate = useNavigate();
  const [permits, setPermits] = useState<PermitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermits = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getOwnerPermitsApi();
        setPermits(response.data ?? []);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(
          error?.response?.data?.message ??
            "Failed to load permit list. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPermits();
  }, []);

  const handlePermitSelect = (permit: PermitType) => {
    navigate(`/home/user/application-request/${permit._id}`);
  };

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="box-border flex h-full min-h-0 w-full flex-col bg-gray-50 px-2.5 py-4 sm:min-h-screen sm:px-4 sm:py-8 lg:px-6">
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-[#D9DEE6] bg-white shadow-sm sm:rounded-3xl">
        <header
          data-owner-tour="application-request-header"
          className="bg-[#0F2942] px-5 py-6 sm:px-8 sm:py-10 flex flex-col justify-center shrink-0"
        >
          <button
            type="button"
            onClick={() => navigate("/home/user/dashboard")}
            className="mb-3 inline-flex w-fit items-center gap-2 text-white/70 transition-colors cursor-pointer hover:text-white sm:mb-4"
          >
            <FiArrowLeft className="text-lg" />
            <span className="text-sm font-bold">Back to Dashboard</span>
          </button>
          <h1 className="text-lg font-black uppercase tracking-wide text-white sm:text-3xl">
            New Application
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-white/80 sm:text-lg">
            Select a permit type below to start your application process.
          </p>
        </header>

        <section className="flex grow flex-col bg-white px-4 py-5 min-h-0 overflow-hidden sm:px-8 sm:py-8 sm:overflow-visible lg:px-10">
          {error ? (
            <div className="flex flex-col items-center justify-center grow">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center max-w-md w-full">
                <p className="text-red-700 font-bold mb-2">
                  Unable to load permits
                </p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          ) : permits.length === 0 ? (
            <div className="flex flex-col items-center justify-center grow">
              <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center max-w-lg w-full">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <FiFileText className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  No Permits Available
                </h3>
                <p className="text-gray-500 mt-1">
                  There are currently no permit types available for application.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex min-h-0 flex-1 flex-col sm:hidden">
                <AnimatedList
                  items={permits}
                  onItemSelect={(permit) => handlePermitSelect(permit)}
                  getItemKey={(permit) => permit._id}
                  getItemLabel={(permit) => permit.name}
                  showGradients={false}
                  enableArrowNavigation={false}
                  displayScrollbar={false}
                  className="min-h-0 flex-1"
                  listClassName="h-full max-h-none overflow-y-auto pr-1"
                  renderItem={(permit, _index, isSelected) => (
                    <div
                      className={`overflow-hidden rounded-[1.5rem] border p-4 shadow-sm transition-all duration-200 ${
                        isSelected
                          ? "border-[#E6BF43] bg-[#FFF9E6]"
                          : "border-gray-100 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F4F8FC] text-xl text-[#0F2942]">
                          <FiFileText />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-[#0F2942]">
                                {permit.name}
                              </h3>
                              <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-gray-500">
                                {getPermitDescription(permit)}
                              </p>
                            </div>

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-100 text-gray-400">
                              <FiArrowRight />
                            </div>
                          </div>

                          <div className="mt-4 border-t border-gray-100 pt-3">
                            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0F2942]">
                              Apply Now
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>

              <div className="hidden h-fit w-full grid-cols-1 gap-6 sm:grid md:grid-cols-2 xl:grid-cols-3">
                {permits.map((permit) => (
                  <button
                    key={permit._id}
                    onClick={() => handlePermitSelect(permit)}
                    className="no-login-theme group relative flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-8 text-left shadow-sm transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-[#E6BF43] hover:bg-[#F2C94C] hover:shadow-xl"
                  >
                    <div className="mb-6 flex w-full items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F8FC] text-2xl text-[#0F2942] transition-colors duration-300 group-hover:bg-[#0F2942] group-hover:text-white">
                        <FiFileText />
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-gray-400 transition-colors group-hover:border-[#0F2942] group-hover:text-[#0F2942]">
                        <FiArrowRight />
                      </div>
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-[#0F2942]">
                      {permit.name}
                    </h3>

                    <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-gray-500 transition-colors group-hover:text-[#4F647A]">
                      {getPermitDescription(permit)}
                    </p>

                    <div className="mt-auto w-full border-t border-gray-100 pt-6 transition-colors group-hover:border-white/80">
                      <span className="text-xs font-bold text-[#0F2942] uppercase tracking-wider group-hover:underline underline-offset-4">
                        Apply Now
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
