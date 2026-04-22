import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";

export const getSocket = () => {
  if (!socket) {
    socket = io(WS_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,   // never give up
      reconnectionDelay: 1000,          // start at 1s
      reconnectionDelayMax: 30000,      // max 30s between retries
      randomizationFactor: 0.5,
      timeout: 20000,
      autoConnect: false,               // we connect manually
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
