import { Client, StompSubscription } from "@stomp/stompjs";
import { getAccessToken } from "./AxiosUtil";

let client: Client | null = null;

// 재연결(onConnect) 시 다시 구독해야 하는 콜백들. subscribe 함수들이 add/delete로 등록·해제한다.
const resubscribeCallbacks = new Set<() => void>();

function handleReconnect() {
  resubscribeCallbacks.forEach((cb) => cb());
}

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
    onConnect: handleReconnect,
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
  let subs: StompSubscription[] = [];

  const subscribeAll = () => {
    if (!client?.connected) return;
    subs = [
      client.subscribe(`/topic/room/${roomId}`, (msg) =>
        handlers.onMessage(msg.body),
      ),
      client.subscribe(`/topic/room/${roomId}/read`, (msg) =>
        handlers.onRead(msg.body),
      ),
      client.subscribe(`/topic/room/${roomId}/typing`, (msg) =>
        handlers.onTyping(msg.body),
      ),
    ];
  };

  resubscribeCallbacks.add(subscribeAll);
  subscribeAll();

  return () => {
    subs.forEach((s) => s.unsubscribe());
    resubscribeCallbacks.delete(subscribeAll);
  };
}

export function subscribeOnlyRoom(
  roomId: string,
  onMessage: (body: string) => void,
) {
  let subs: StompSubscription[] = [];

  const subscribeAll = () => {
    if (!client?.connected) return;
    subs = [
      client.subscribe(`/topic/room/${roomId}`, (msg) => onMessage(msg.body)),
    ];
  };

  resubscribeCallbacks.add(subscribeAll);
  subscribeAll();

  return () => {
    subs.forEach((s) => s.unsubscribe());
    resubscribeCallbacks.delete(subscribeAll);
  };
}

export function subscribePresenceCount(onCount: (body: string) => void) {
  let subs: StompSubscription[] = [];

  const subscribeAll = () => {
    if (!client?.connected) return;
    subs = [
      client.subscribe(`/topic/presence/count`, (msg) => onCount(msg.body)),
      client.subscribe(`/app/presence/count`, (msg) => onCount(msg.body)),
    ];
  };

  resubscribeCallbacks.add(subscribeAll);
  subscribeAll();

  return () => {
    subs.forEach((s) => s.unsubscribe());
    resubscribeCallbacks.delete(subscribeAll);
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

export function publishRead(roomId: number, body: unknown) {
  if (!client?.connected) {
    throw new Error("STOMP client is not connected");
  }

  client.publish({
    destination: `/app/rooms/${roomId}/read`,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
