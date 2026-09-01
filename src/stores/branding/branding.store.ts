import DefaultBploLogo from "@/assets/BPLOLogo.png";
import { getBrandingLogoApi } from "@/api/branding/branding.api";
import { create } from "zustand";

const applyBrandingFavicon = (logoUrl: string) => {
  if (typeof document === "undefined") return;

  const nextIconUrl = logoUrl.trim() || DefaultBploLogo;
  const iconLinks = Array.from(
    document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="apple-touch-icon"]',
    ),
  );

  if (iconLinks.length === 0) {
    const faviconLink = document.createElement("link");
    faviconLink.rel = "icon";
    faviconLink.type = "image/png";
    document.head.appendChild(faviconLink);
    iconLinks.push(faviconLink);
  }

  iconLinks.forEach((link) => {
    link.href = nextIconUrl;
    if (link.rel === "icon") {
      link.type = "image/png";
    }
  });
};

applyBrandingFavicon(DefaultBploLogo);

type BrandingStoreType = {
  logoUrl: string;
  isLoaded: boolean;
  isLoading: boolean;
  fetchLogo: (force?: boolean) => Promise<void>;
  setLogoUrl: (logoUrl: string) => void;
};

export const useBrandingStore = create<BrandingStoreType>((set, get) => ({
  logoUrl: DefaultBploLogo,
  isLoaded: false,
  isLoading: false,

  fetchLogo: async (force = false) => {
    if (!force && get().isLoaded) return;
    if (get().isLoading) return;

    set({ isLoading: true });
    try {
      const response = await getBrandingLogoApi();
      const nextLogoUrl = String(response.data?.logoUrl ?? "").trim();
      const resolvedLogoUrl = nextLogoUrl || DefaultBploLogo;

      applyBrandingFavicon(resolvedLogoUrl);

      set({
        logoUrl: resolvedLogoUrl,
        isLoaded: true,
      });
    } catch {
      applyBrandingFavicon(DefaultBploLogo);
      set({ logoUrl: DefaultBploLogo, isLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  setLogoUrl: (logoUrl) => {
    const resolvedLogoUrl = logoUrl.trim() || DefaultBploLogo;
    applyBrandingFavicon(resolvedLogoUrl);
    set({ logoUrl: resolvedLogoUrl, isLoaded: true });
  },
}));
