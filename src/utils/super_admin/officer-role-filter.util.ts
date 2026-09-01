export const normalizeOfficerRoleFilterValue = (
  role: string | null | undefined,
) => String(role ?? "").trim().toUpperCase();

export const matchesOfficerRoleTab = (
  role: string | null | undefined,
  activeTab: string,
) =>
  String(activeTab ?? "").trim().toUpperCase() === "ALL" ||
  normalizeOfficerRoleFilterValue(role) ===
    String(activeTab ?? "").trim().toUpperCase();
