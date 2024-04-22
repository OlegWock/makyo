import { WSMessage } from "@shared/websockets";
import { WSContext } from "hono/ws";

const connectedWebsockets: Record<string, WSContext> = {};

export const connectWebsocket = (id: string, ws: WSContext) => {
  connectedWebsockets[id] = ws;
  console.log('Connected WebSocket. Active clients', Object.keys(connectedWebsockets).length);
};

export const disconnectWebsocket = (id: string, ws: WSContext) => {
  console.log('Going to close web socket');
  if (ws.readyState === 0 || ws.readyState === 1) {
    ws.close();
  }
  delete connectedWebsockets[id];
  console.log('Disconnected WebSocket. Active clients', Object.keys(connectedWebsockets).length);
};

export const broadcastWSMessage = (message: WSMessage) => {
  const serialized = JSON.stringify(message);
  Object.values(connectedWebsockets).forEach((ws) => {
    ws.send(serialized);
  });
};
