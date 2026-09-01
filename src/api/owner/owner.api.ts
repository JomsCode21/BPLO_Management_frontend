import axiosInstance from "@/axios/axios-instance";
import type {
  OwnerApplicationDetailType,
  OwnerGeneratedDocumentKind,
  OwnerGeneratedDocumentType,
  OwnerNotificationScope,
  OwnerApplicationStatusDetailType,
  OwnerApplicationStatusType,
} from "@/types/owner/owner.type";
import type {
  PermitApplicationResponsePayload,
  PermitType,
} from "@/types/permit/permit.type";

type OwnerPermitResponse = {
  success: boolean;
  message: string;
  data: PermitType;
};

type OwnerPermitsResponse = {
  success: boolean;
  message: string;
  data: PermitType[];
};

type OwnerApplicationStatusesResponse = {
  success: boolean;
  message: string;
  data: OwnerApplicationStatusType[];
};

type OwnerApplicationDetailResponse = {
  success: boolean;
  message: string;
  data: OwnerApplicationDetailType;
};

type OwnerApplicationStatusDetailResponse = {
  success: boolean;
  message: string;
  data: OwnerApplicationStatusDetailType;
};

type OwnerGeneratedDocumentsResponse = {
  success: boolean;
  message: string;
  data: OwnerGeneratedDocumentType[];
};

const OWNER_APPLICATION_STATUSES_CACHE_TTL_MS = 5_000;

let ownerApplicationStatusesInFlight: Promise<OwnerApplicationStatusesResponse> | null =
  null;

let ownerApplicationStatusesRequestId = 0;

let ownerApplicationStatusesCache: {
  value: OwnerApplicationStatusesResponse;
  expiresAt: number;
} | null = null;

// Detail pages are read frequently when navigating between list/detail views,
// so keep a slightly longer cache than the status list endpoint.
const OWNER_STATUS_DETAIL_CACHE_TTL_MS = 30_000;

const ownerStatusDetailInFlight = new Map<
  string,
  Promise<OwnerApplicationStatusDetailResponse>
>();

const ownerStatusDetailCache = new Map<
  string,
  { value: OwnerApplicationStatusDetailResponse; expiresAt: number }
>();

const resetOwnerStatusesCache = () => {
  // Called after write operations to ensure next reads reflect server state.
  ownerApplicationStatusesCache = null;
  ownerApplicationStatusesInFlight = null;
};

export const getOwnerPermitsApi = async () => {
  const response = await axiosInstance.get("/owner/permits");
  return response.data as OwnerPermitsResponse;
};

export const getOwnerPermitByIdApi = async (
  permitId: string,
  options?: { applicationId?: string },
) => {
  const applicationId = String(options?.applicationId ?? "").trim();
  const response = await axiosInstance.get(`/owner/permits/${permitId}`, {
    params: applicationId ? { applicationId } : undefined,
  });
  return response.data as OwnerPermitResponse;
};

export const submitOwnerPermitApplicationApi = async (
  permitId: string,
  payload: { responses: PermitApplicationResponsePayload[] },
) => {
  const response = await axiosInstance.post(
    `/owner/permits/${permitId}/applications`,
    payload,
  );
  return response.data;
};

export const getOwnerApplicationStatusesApi = async (options?: {
  force?: boolean;
}) => {
  const force = options?.force ?? false;

  if (!force && ownerApplicationStatusesCache) {
    if (ownerApplicationStatusesCache.expiresAt > Date.now()) {
      return ownerApplicationStatusesCache.value;
    }
  }

  if (!force && ownerApplicationStatusesInFlight) {
    // De-duplicate parallel requests from dashboard/sidebar/detail mounts.
    return ownerApplicationStatusesInFlight;
  }

  const requestId = ownerApplicationStatusesRequestId + 1;
  ownerApplicationStatusesRequestId = requestId;

  const request = axiosInstance
    .get("/owner/applications/status")
    .then((response) => {
      const data = response.data as OwnerApplicationStatusesResponse;

      ownerApplicationStatusesCache = {
        value: data,
        expiresAt: Date.now() + OWNER_APPLICATION_STATUSES_CACHE_TTL_MS,
      };

      return data;
    })
    .finally(() => {
      if (ownerApplicationStatusesRequestId === requestId) {
        ownerApplicationStatusesInFlight = null;
      }
    });

  ownerApplicationStatusesInFlight = request;
  return request;
};

export const getOwnerApplicationByIdApi = async (applicationId: string) => {
  const response = await axiosInstance.get(
    `/owner/applications/${applicationId}`,
  );
  return response.data as OwnerApplicationDetailResponse;
};

export const getOwnerApplicationStatusDetailApi = async (
  applicationId: string,
  options?: { force?: boolean },
) => {
  const force = options?.force ?? false;

  if (!force) {
    const cached = ownerStatusDetailCache.get(applicationId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
  }

  const existingRequest = ownerStatusDetailInFlight.get(applicationId);
  if (existingRequest) return existingRequest;

  const request = axiosInstance
    .get(`/owner/applications/${applicationId}/status-detail`)
    .then((response) => {
      const data = response.data as OwnerApplicationStatusDetailResponse;

      ownerStatusDetailCache.set(applicationId, {
        value: data,
        expiresAt: Date.now() + OWNER_STATUS_DETAIL_CACHE_TTL_MS,
      });

      return data;
    })
    .finally(() => {
      ownerStatusDetailInFlight.delete(applicationId);
    });

  ownerStatusDetailInFlight.set(applicationId, request);
  return request;
};

export const getOwnerGeneratedDocumentsApi = async () => {
  const response = await axiosInstance.get("/owner/generated-documents");
  return response.data as OwnerGeneratedDocumentsResponse;
};

export const getOwnerGeneratedDocumentPdfApi = async (
  applicationId: string,
  documentKind: OwnerGeneratedDocumentKind,
) => {
  const path =
    documentKind === "permit"
      ? "generated-permit"
      : "generated-inspection-certificate";
  const response = await axiosInstance.get(
    `/owner/applications/${applicationId}/${path}`,
    {
      responseType: "blob",
    },
  );

  return response.data as Blob;
};

export const markOwnerApplicationStatusAsReadApi = async (
  applicationId: string,
) => {
  const response = await axiosInstance.patch(
    `/owner/applications/${applicationId}/read`,
  );
  resetOwnerStatusesCache();
  return response.data;
};

export const markAllOwnerApplicationStatusesAsReadApi = async (
  scope?: OwnerNotificationScope,
) => {
  const response = await axiosInstance.patch("/owner/applications/read-all", {
    scope,
  });
  resetOwnerStatusesCache();
  return response.data;
};

export const resubmitOwnerApplicationApi = async (
  applicationId: string,
  payload: { responses: PermitApplicationResponsePayload[] },
) => {
  const response = await axiosInstance.put(
    `/owner/applications/${applicationId}/resubmit`,
    payload,
  );
  resetOwnerStatusesCache();
  return response.data;
};

export const requestOwnerInspectionReassessmentApi = async (
  applicationId: string,
) => {
  const response = await axiosInstance.patch(
    `/owner/applications/${applicationId}/reassessment-request`,
  );
  resetOwnerStatusesCache();
  return response.data;
};
