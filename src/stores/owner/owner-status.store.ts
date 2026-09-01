import { getOwnerApplicationStatusesApi } from "@/api/owner/owner.api";
import {
  createOwnerSocket,
  OWNER_APPLICATIONS_EVENT,
  type OwnerApplicationsEventPayload,
} from "@/socket/owner.socket";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { OwnerApplicationStatusType } from "@/types/owner/owner.type";
import { create } from "zustand";

type FetchOwnerStatusesOptions = {
  force?: boolean;
};

type OwnerStatusStoreType = {
  applications: OwnerApplicationStatusType[];
  hasLoaded: boolean;
  realtimeConnected: boolean;
  lastRealtimeEventAt: string | null;
  fetchStatuses: (
    options?: FetchOwnerStatusesOptions,
  ) => Promise<OwnerApplicationStatusType[]>;
  ensureRealtime: () => void;
  markStatusAsReadOptimistic: (
    statusId: string,
  ) => OwnerApplicationStatusType | null;
  restoreStatus: (status: OwnerApplicationStatusType | null) => void;
  markAllAsReadOptimistic: (
    matcher?: (status: OwnerApplicationStatusType) => boolean,
  ) => OwnerApplicationStatusType[];
  restoreApplications: (applications: OwnerApplicationStatusType[]) => void;
  reset: () => void;
};

let latestOwnerStatusRequestId = 0;
let hasInitializedOwnerRealtime = false;

const cloneStatus = (status: OwnerApplicationStatusType) => ({ ...status });

const shouldRefreshForPayload = (payload?: OwnerApplicationsEventPayload) => {
  const currentUserId = String(useAuthStore.getState().user?._id ?? "").trim();
  const applicantId = String(payload?.applicantId ?? "").trim();

  if (!applicantId || !currentUserId) {
    return true;
  }

  return applicantId === currentUserId;
};

export const useOwnerStatusStore = create<OwnerStatusStoreType>((set, get) => ({
  applications: [],
  hasLoaded: false,
  realtimeConnected: false,
  lastRealtimeEventAt: null,

  fetchStatuses: async (options) => {
    const force = options?.force ?? false;
    const requestId = latestOwnerStatusRequestId + 1;
    latestOwnerStatusRequestId = requestId;

    const response = await getOwnerApplicationStatusesApi({ force });

    if (requestId !== latestOwnerStatusRequestId) {
      return get().applications;
    }

    const nextApplications = response.data ?? [];
    set({
      applications: nextApplications,
      hasLoaded: true,
    });

    return nextApplications;
  },

  ensureRealtime: () => {
    const socket = createOwnerSocket();

    if (!hasInitializedOwnerRealtime) {
      const handleConnect = () => {
        set({
          realtimeConnected: true,
        });

        void get().fetchStatuses({ force: true }).catch(() => {
          // Ignore transient realtime refresh failures. Owner pages already
          // expose load errors when a manual fetch is needed.
        });
      };

      const handleDisconnect = () => {
        set({
          realtimeConnected: false,
        });
      };

      const handleRefresh = (payload?: OwnerApplicationsEventPayload) => {
        if (!shouldRefreshForPayload(payload)) {
          return;
        }

        set({
          lastRealtimeEventAt: new Date().toISOString(),
        });

        void get().fetchStatuses({ force: true }).catch(() => {
          // Ignore transient realtime refresh failures. Owner pages already
          // expose load errors when a manual fetch is needed.
        });
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on(OWNER_APPLICATIONS_EVENT, handleRefresh);
      hasInitializedOwnerRealtime = true;
    }

    if (socket.connected) {
      set({
        realtimeConnected: true,
      });
      return;
    }

    socket.connect();
  },

  markStatusAsReadOptimistic: (statusId) => {
    const previous = get().applications.find((item) => item._id === statusId);
    if (!previous) return null;

    const readAt = new Date().toISOString();

    set({
      applications: get().applications.map((item) =>
        item._id === statusId
          ? {
              ...item,
              isRead: true,
              unreadCount: 0,
              readAt,
            }
          : item,
      ),
    });

    return cloneStatus(previous);
  },

  restoreStatus: (status) => {
    if (!status) return;

    set({
      applications: get().applications.map((item) =>
        item._id === status._id ? cloneStatus(status) : item,
      ),
    });
  },

  markAllAsReadOptimistic: (matcher) => {
    const snapshot = get().applications.map(cloneStatus);
    const readAt = new Date().toISOString();
    const shouldMark = matcher ?? (() => true);

    set({
      applications: get().applications.map((item) =>
        shouldMark(item)
          ? {
              ...item,
              isRead: true,
              unreadCount: 0,
              readAt,
            }
          : item,
      ),
    });

    return snapshot;
  },

  restoreApplications: (applications) => {
    set({
      applications: applications.map(cloneStatus),
      hasLoaded: true,
    });
  },

  reset: () => {
    set({
      applications: [],
      hasLoaded: false,
      realtimeConnected: false,
      lastRealtimeEventAt: null,
    });
  },
}));
