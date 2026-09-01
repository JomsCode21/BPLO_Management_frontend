type ManagedBrandingUrlMatcher = (url: string) => boolean;

export const shouldDeletePreviousBrandingLogo = (
  previousLogoUrl: string,
  nextLogoUrl: string,
  isManagedBrandingUrl: ManagedBrandingUrlMatcher,
) => {
  const previousUrl = String(previousLogoUrl ?? "").trim();
  const nextUrl = String(nextLogoUrl ?? "").trim();

  return Boolean(
    previousUrl &&
      previousUrl !== nextUrl &&
      isManagedBrandingUrl(previousUrl),
  );
};

export const shouldCleanupUploadedBrandingLogoOnFailure = (
  uploadedLogoUrl: string,
  previousLogoUrl: string,
  isManagedBrandingUrl: ManagedBrandingUrlMatcher,
) => {
  const uploadedUrl = String(uploadedLogoUrl ?? "").trim();
  const previousUrl = String(previousLogoUrl ?? "").trim();

  return Boolean(
    uploadedUrl &&
      uploadedUrl !== previousUrl &&
      isManagedBrandingUrl(uploadedUrl),
  );
};
