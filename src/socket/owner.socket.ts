import type { OwnerApplicationStatusSource } from "@/types/owner/owner.type";
import type { Socket } from "socket.io-client";
import {
  createAuthenticatedSocket,
  prepareAuthenticatedSocket,
} from "./socket-client";

export const OWNER_APPLICATIONS_EVENT = "owner:applications_update";

export type OwnerApplicationsEventPayload = {
  applicantId?: string;
  applicationId?: string;
  ownerStatusVersion?: number;
  ownerStatusReadVersion?: number;
  unreadTotal?: number;
  statusSource?: OwnerApplicationStatusSource;
};

let ownerSocket: Socket | null = null;

export const createOwnerSocket = () => {
  if (!ownerSocket) {
    ownerSocket = createAuthenticatedSocket({ autoConnect: false });
  }

  return prepareAuthenticatedSocket(ownerSocket);
};
