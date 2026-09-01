import assert from "node:assert/strict";

import {
  shouldCleanupUploadedBrandingLogoOnFailure,
  shouldDeletePreviousBrandingLogo,
} from "../utils/super_admin/branding-logo-replacement.util";
import {
  matchesOfficerRoleTab,
  normalizeOfficerRoleFilterValue,
} from "../utils/super_admin/officer-role-filter.util";

const runCase = (name: string, callback: () => void) => {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const managedLogoUrl =
  "http://localhost:5000/api/uploads/render?folder=bplo%2Fbranding%2Flogo%2Fold&filename=old.webp";
const nextManagedLogoUrl =
  "http://localhost:5000/api/uploads/render?folder=bplo%2Fbranding%2Flogo%2Fnew&filename=new.webp";
const externalLogoUrl = "https://example.com/logo.png";

const isManagedBrandingUrl = (url: string) =>
  url.includes("/api/uploads/render?");

runCase("BPLO admin stays inside the BPLO admin tab", () => {
  assert.equal(normalizeOfficerRoleFilterValue("bplo_admin"), "BPLO_ADMIN");
  assert.equal(matchesOfficerRoleTab("bplo_admin", "BPLO_ADMIN"), true);
  assert.equal(matchesOfficerRoleTab("bplo_admin", "SUPER_ADMIN"), false);
});

runCase("super admin filtering still matches only super admin accounts", () => {
  assert.equal(matchesOfficerRoleTab("super_admin", "SUPER_ADMIN"), true);
  assert.equal(matchesOfficerRoleTab("super_admin", "BPLO_ADMIN"), false);
});

runCase("branding replacement deletes only the previous managed logo after success", () => {
  assert.equal(
    shouldDeletePreviousBrandingLogo(
      managedLogoUrl,
      nextManagedLogoUrl,
      isManagedBrandingUrl,
    ),
    true,
  );
  assert.equal(
    shouldDeletePreviousBrandingLogo(
      managedLogoUrl,
      managedLogoUrl,
      isManagedBrandingUrl,
    ),
    false,
  );
  assert.equal(
    shouldDeletePreviousBrandingLogo(
      externalLogoUrl,
      nextManagedLogoUrl,
      isManagedBrandingUrl,
    ),
    false,
  );
});

runCase("branding save failure cleans up only the newly uploaded managed logo", () => {
  assert.equal(
    shouldCleanupUploadedBrandingLogoOnFailure(
      nextManagedLogoUrl,
      managedLogoUrl,
      isManagedBrandingUrl,
    ),
    true,
  );
  assert.equal(
    shouldCleanupUploadedBrandingLogoOnFailure(
      managedLogoUrl,
      managedLogoUrl,
      isManagedBrandingUrl,
    ),
    false,
  );
  assert.equal(
    shouldCleanupUploadedBrandingLogoOnFailure(
      externalLogoUrl,
      managedLogoUrl,
      isManagedBrandingUrl,
    ),
    false,
  );
});

console.log("All super admin frontend regression checks passed.");
