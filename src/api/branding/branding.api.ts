import axiosInstance from "@/axios/axios-instance";

type BrandingLogoResponse = {
  success: boolean;
  data: {
    logoUrl: string;
  };
  message: string;
};

export const getBrandingLogoApi = async () => {
  const response = await axiosInstance.get("/super-admin/branding/logo");
  return response.data as BrandingLogoResponse;
};

export const updateBrandingLogoApi = async (logoUrl: string) => {
  const response = await axiosInstance.put("/super-admin/branding/logo", {
    logoUrl,
  });
  return response.data as BrandingLogoResponse;
};
