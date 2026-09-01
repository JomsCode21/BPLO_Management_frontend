import { useTokenStore } from "@/stores/token/token.store";
import { io, type Socket } from "socket.io-client";

const rawApiUrl = String(import.meta.env.VITE_API_URL ?? "");
const socketBaseUrl = rawApiUrl.replace(/\/api\/?$/, "");
const SOCKET_TRANSPORTS = ["polling", "websocket"];

const managedSockets = new Set<Socket>();

const buildSocketAuth = () => {
  const token = String(useTokenStore.getState().accessToken ?? "").trim();
  return token ? { token } : {};
};

const syncSocketAuth = (socket: Socket) => {
  socket.auth = buildSocketAuth();
};

const bindManagedSocket = <T extends Socket>(socket: T) => {
  const managedSocket = socket as T & { __bploSocketManaged?: boolean };

  if (!managedSocket.__bploSocketManaged) {
    const refreshAuth = () => {
      syncSocketAuth(socket);
    };

    socket.io.on("reconnect_attempt", refreshAuth);
    socket.on("connect_error", refreshAuth);
    socket.on("disconnect", (reason) => {
      if (reason === "io client disconnect") {
        managedSockets.delete(socket);
      }
    });

    managedSocket.__bploSocketManaged = true;
  }

  managedSockets.add(socket);
  syncSocketAuth(socket);

  return socket;
};

export const getRealtimeSocketBaseUrl = () => socketBaseUrl;

export const prepareAuthenticatedSocket = <T extends Socket>(socket: T) =>
  bindManagedSocket(socket);

export const createAuthenticatedSocket = (options?: {
  autoConnect?: boolean;
}) => {
  const socket = prepareAuthenticatedSocket(
    io(socketBaseUrl, {
      auth: buildSocketAuth(),
      autoConnect: false,
      withCredentials: true,
      transports: SOCKET_TRANSPORTS,
    }),
  );

  if (options?.autoConnect !== false) {
    socket.connect();
  }

  return socket;
};

export const disconnectAllRealtimeSockets = () => {
  for (const socket of [...managedSockets]) {
    socket.disconnect();
  }

  managedSockets.clear();
};
