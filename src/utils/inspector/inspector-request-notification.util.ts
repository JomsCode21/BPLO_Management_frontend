export const INSPECTOR_REQUEST_NOTIFICATION_SYNC_EVENT =
  "inspector:request_notification_sync";

const sanitizeInspectorId = (inspectorId?: string | null) =>
  String(inspectorId ?? "").trim();

const getSeenStorageKey = (inspectorId?: string | null) =>
  `bplo_inspector_request_seen_at:${sanitizeInspectorId(inspectorId)}`;

const getUpdatedStorageKey = (inspectorId?: string | null) =>
  `bplo_inspector_request_updated_at:${sanitizeInspectorId(inspectorId)}`;

const parseTimestamp = (value: unknown) => {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return 0;
  }

  return Math.floor(timestamp);
};

const toTimestamp = (value?: string | number | Date | null) => {
  if (value instanceof Date) {
    return parseTimestamp(value.getTime());
  }

  if (typeof value === "number") {
    return parseTimestamp(value);
  }

  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return parseTimestamp(parsed);
  }

  return parseTimestamp(Date.now());
};

const emitSyncEvent = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(INSPECTOR_REQUEST_NOTIFICATION_SYNC_EVENT));
};

export const getInspectorRequestSeenAt = (inspectorId?: string | null) => {
  const normalizedId = sanitizeInspectorId(inspectorId);
  if (!normalizedId || typeof window === "undefined") {
    return 0;
  }

  return parseTimestamp(window.localStorage.getItem(getSeenStorageKey(normalizedId)));
};

export const getInspectorRequestUpdatedAt = (inspectorId?: string | null) => {
  const normalizedId = sanitizeInspectorId(inspectorId);
  if (!normalizedId || typeof window === "undefined") {
    return 0;
  }

  return parseTimestamp(
    window.localStorage.getItem(getUpdatedStorageKey(normalizedId)),
  );
};

export const hasUnseenInspectorRequests = (
  inspectorId?: string | null,
  pendingRequestCount?: number,
) => {
  const normalizedId = sanitizeInspectorId(inspectorId);
  if (!normalizedId) return false;

  if (typeof pendingRequestCount === "number") {
    const pendingCount = Number(pendingRequestCount);
    if (!Number.isFinite(pendingCount) || pendingCount <= 0) return false;
  }

  const seenAt = getInspectorRequestSeenAt(normalizedId);
  const updatedAt = getInspectorRequestUpdatedAt(normalizedId);

  if (updatedAt > seenAt) return true;

  if (typeof pendingRequestCount === "number") {
    // If there are pending requests and this inspector has never viewed the page yet,
    // surface a notification dot so requests are not missed.
    return seenAt === 0;
  }

  return false;
};

export const markInspectorRequestsUpdated = (
  inspectorId?: string | null,
  updatedAt?: string | number | Date | null,
) => {
  const normalizedId = sanitizeInspectorId(inspectorId);
  if (!normalizedId || typeof window === "undefined") {
    return;
  }

  const nextTimestamp = toTimestamp(updatedAt);
  const currentTimestamp = getInspectorRequestUpdatedAt(normalizedId);
  const storedTimestamp = Math.max(currentTimestamp, nextTimestamp);
  window.localStorage.setItem(
    getUpdatedStorageKey(normalizedId),
    String(storedTimestamp),
  );
  emitSyncEvent();
};

export const markInspectorRequestsSeen = (
  inspectorId?: string | null,
  seenAt?: string | number | Date | null,
) => {
  const normalizedId = sanitizeInspectorId(inspectorId);
  if (!normalizedId || typeof window === "undefined") {
    return;
  }

  const nextTimestamp = toTimestamp(seenAt);
  window.localStorage.setItem(getSeenStorageKey(normalizedId), String(nextTimestamp));
  emitSyncEvent();
};
