import { io } from "socket.io-client";
import { API_ORIGIN } from "./config";

// Lazy/auto connect to the same backend origin as the REST API.
const socket = io(API_ORIGIN, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;
