import { Client, StompSubscription } from "@stomp/stompjs";
import { getAccessToken } from "./AxiosUtil";

let client: Client | null = null;

export function connectStomp() {
  if (client) return;

  client = new Client({
    brokerURL: process.env.NEXT_PUBLIC_WS_BASE_URL,
    connectHeaders: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.activate();
}

export function disconnectStomp() {
  client?.deactivate();
  client = null;
}

export function getStompClient() {
  return client;
}

interface RoomSubscriptionHandlers {
  onMessage: (body: string) => void;
  onRead: (body: string) => void;
  onTyping: (body: string) => void;
}

export function subscribeRoom(
  roomId: string,
  handlers: RoomSubscriptionHandlers,
) {
  const c = client;
  if (!c) return () => {};

  let subs: StompSubscription[] = [];

  const subscribeAll = () => {
    subs = [
      c.subscribe(`/topic/room/${roomId}`, (msg) =>
        handlers.onMessage(msg.body),
      ),
      c.subscribe(`/topic/room/${roomId}/read`, (msg) =>
        handlers.onRead(msg.body),
      ),
      c.subscribe(`/topic/room/${roomId}/typing`, (msg) =>
        handlers.onTyping(msg.body),
      ),
    ];
  };

  const prevOnConnect = c.onConnect;
  c.onConnect = (frame) => {
    prevOnConnect?.(frame);
    subscribeAll();
  };

  if (c.connected) subscribeAll();

  return () => {
    subs.forEach((s) => s.unsubscribe());
    c.onConnect = prevOnConnect;
  };
}

export function subscribePresenceCount(onCount: (body: string) => void) {
  const c = client;
  if (!c) return () => {};

  let subs: StompSubscription[] = [];

  const subscribe = () => {
    subs = [
      c.subscribe(`/topic/presence/count`, (msg) => onCount(msg.body)),
      c.subscribe(`/app/presence/count`, (msg) => onCount(msg.body)),
    ];
  };

  const prevOnConnect = c.onConnect;
  c.onConnect = (frame) => {
    prevOnConnect?.(frame);
    subscribe();
  };

  if (c.connected) subscribe();

  return () => {
    subs.forEach((s) => s.unsubscribe());
    c.onConnect = prevOnConnect;
  };
}

export function publishMessage(roomId: number, body: unknown) {
  if (!client?.connected) {
    throw new Error("STOMP client is not connected");
  }

  client.publish({
    destination: `/app/rooms/${roomId}/messages`,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function publishTyping(roomId: number, isTyping: boolean) {
  if (!client?.connected) {
    throw new Error("STOMP client is not connected");
  }
  client.publish({
    destination: `/app/rooms/${roomId}/typing`,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ typing: isTyping }),
  });
}
