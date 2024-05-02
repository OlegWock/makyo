import { SubscriptionMessage } from "@shared/subscription";
import { iife } from "@shared/utils";
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


// TODO: when new client connects, it also receives old messages already in stream. We need to send events that happened after user connected to the endpoint
export const sseController = iife(() => {
  let streamController: null | ReadableStreamDefaultController<string> = null;

  const eventsSource: UnderlyingDefaultSource<string> = {
    start(controller: ReadableStreamDefaultController<string>) {
      streamController = controller;
    },
    cancel() {

    }
  };

  const emit = (message: string) => {
    const event = `data: ${message}\n\n`;
    streamController?.enqueue(event);
  };

  let eventsStream = new ReadableStream(eventsSource);
  const getStreamCopy = () => {
    const [s1, s2] = eventsStream.tee();
    eventsStream = s1;
    return s2;
  }


  return { eventsSource, emit, getStreamCopy };
});

export const broadcastSubscriptionMessage = (message: SubscriptionMessage) => {
  const serialized = JSON.stringify(message);
  sseController.emit(serialized);
  Object.values(connectedWebsockets).forEach((ws) => {
    ws.send(serialized);
  });
};
