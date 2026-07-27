import { ref, onUnmounted } from "vue";
import { cookieHelper, commonUtil } from "@common";
import logger from "@/logger";

export interface MoquiNotificationsOptions {
  /** Milliseconds to wait before attempting a reconnect after an abnormal close. Default: 3000 */
  reconnectDelay?: number;
  /** Callback fired when the WebSocket connection state changes */
  onConnectionChange?: (isConnected: boolean) => void;
}

export interface MoquiNotificationMessage {
  topic?: string;
  dataDocumentId?: string;
  documents?: any[];
  [key: string]: any;
}

/**
 * Composable that opens a WebSocket to the Moqui /notws notification endpoint,
 * subscribes to the supplied topics, and calls `onMessage` for each incoming
 * notification document.
 *
 * Auto-reconnects on abnormal close.  Callbacks are guarded against stale
 * socket references so that an in-flight reconnect cannot dispatch events
 * from the previous (dead) socket.
 */
export function useMoquiNotifications(
  topics: string[],
  onMessage: (message: MoquiNotificationMessage) => void,
  options: MoquiNotificationsOptions = {}
) {
  const { reconnectDelay = 3000 } = options;

  const isConnected = ref(false);

  // The active socket.  A ref so watchers can track it, but we also keep a
  // plain variable for synchronous guard checks in callbacks.
  let activeSocket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;

  /** Build the WebSocket URL from the OMS cookie and session token cookie. */
  function buildWsUrl(): string | null {
    const oms = commonUtil.getOmsURL();
    const token = cookieHelper().get("token") as string;
    console.log("[useMoquiNotifications] buildWsUrl oms:", oms, "token:", !!token);

    if (!oms || !token) {
      console.warn("[useMoquiNotifications] OMS URL or token cookie missing; cannot connect.");
      return null;
    }

    try {
      // Replace the http(s) scheme with ws(s).
      let base = oms.replace(/^https?:\/\//, (match: string) =>
        match.startsWith("https") ? "wss://" : "ws://"
      );

      // Remove /rest/s1/ or /api/ if present, since websockets are usually mounted at the context root
      base = base.replace(/\/(rest\/s1|api)\/?$/, "");

      const url = `${base.replace(/\/$/, "")}/notws?moquiSessionToken=${encodeURIComponent(token)}`;
      console.log("[useMoquiNotifications] Built WebSocket URL:", url);
      return url;
    } catch (err) {
      console.error("[useMoquiNotifications] Invalid OMS URL", err);
      return null;
    }
  }

  /** Send subscription frames once the socket is open. */
  function subscribe(socket: WebSocket) {
    topics.forEach((topic) => {
      try {
        socket.send(`subscribe:${topic}`);
        socket.send(`subscribe ${topic}`);
        socket.send(JSON.stringify({ action: "subscribe", topic }));
      } catch (err) {
        logger.error(`[useMoquiNotifications] Failed to subscribe to topic "${topic}"`, err);
      }
    });
  }

  function connect() {
    destroyed = false;

    const url = buildWsUrl();
    if (!url) return;

    // Prevent leaking connections if connect() is called multiple times
    if (activeSocket) {
      activeSocket.close(1000, "reconnecting");
    }

    const socket = new WebSocket(url);
    activeSocket = socket;

    socket.onopen = () => {
      // Guard: discard if this socket was superseded before the open event fired.
      if (socket !== activeSocket) {
        socket.close();
        return;
      }
      isConnected.value = true;
      if (options.onConnectionChange) options.onConnectionChange(true);
      subscribe(socket);
    };

    socket.onmessage = (event: MessageEvent) => {
      // Guard: discard messages from stale sockets.
      if (socket !== activeSocket) return;

      try {
        const data: MoquiNotificationMessage = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        logger.error("[useMoquiNotifications] Failed to parse message", err);
      }
    };

    socket.onerror = (event: Event) => {
      if (socket !== activeSocket) return;
      logger.error("[useMoquiNotifications] WebSocket error", event);
    };

    socket.onclose = (event: CloseEvent) => {
      if (socket !== activeSocket) return;
      isConnected.value = false;
      if (options.onConnectionChange) options.onConnectionChange(false);

      // 1000 = normal closure; anything else is unexpected — schedule reconnect.
      if (!destroyed && event.code !== 1000) {
        reconnectTimer = setTimeout(() => {
          if (!destroyed) connect();
        }, reconnectDelay);
      }
    };
  }

  function disconnect() {
    destroyed = true;
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (activeSocket) {
      activeSocket.close(1000, "intentional disconnect");
      activeSocket = null;
    }
    isConnected.value = false;
    if (options.onConnectionChange) options.onConnectionChange(false);
  }

  function reconnect() {
    destroyed = false;
    if (activeSocket) {
      activeSocket.close(1000, "forced reconnect");
      activeSocket = null;
    }
    connect();
  }

  // Ensure cleanup when the component that owns this composable is destroyed.
  // This is critical for preventing connection leaks during Hot Module Replacement (HMR).
  onUnmounted(() => {
    disconnect();
  });

  return {
    isConnected,
    connect,
    disconnect,
    reconnect,
  };
}
