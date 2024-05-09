import { ApiClient } from "@client/api";

type ProxyIncomingMessageType =
  { type: 'request', id: string, method: string, url: string, headers: Record<string, string>, body?: string };

type ProxyOutgoingMessageType =
  | { type: 'response', id: string, body: string, headers: Record<string, string>, statusCode: number }
  | { type: 'error', id: string, error: string };

const wrapWebSocket = (factory: () => WebSocket) => {
  const flushQueue = () => {
    if (ws.readyState !== 1) return;
    outgoingMessagesQueue.forEach((message) => {
      ws.send(JSON.stringify(message));
    });
    outgoingMessagesQueue.splice(0, outgoingMessagesQueue.length);
  };

  const initializeSocket = (socket: WebSocket) => {
    socket.onopen = () => {
      flushQueue();
    }
    socket.onmessage = (e) => {
      const message = JSON.parse(e.data) as ProxyIncomingMessageType;
      messageHandlers.forEach(cb => {
        try {
          cb(message);
        } catch (err) {
          console.log(err);
        }
      });
    };
    socket.onerror = (e) => {
      console.log('Websocket error', e);
      setTimeout(() => {
        ws = factory();
        initializeSocket(ws);
      }, 100);
    };

  };

  const messageHandlers = new Set<(message: ProxyIncomingMessageType) => void>();
  const outgoingMessagesQueue: ProxyOutgoingMessageType[] = [];
  let ws = factory();
  initializeSocket(ws);

  return {
    onMessage: (cb: (message: ProxyIncomingMessageType) => void) => {
      messageHandlers.add(cb);

      return () => {
        messageHandlers.delete(cb);
      };
    },
    send: (message: ProxyOutgoingMessageType) => {
      outgoingMessagesQueue.push(message);
      flushQueue();
    }
  };
}

export const initiateLocalOllamaProxy = (api: ApiClient) => {
  const ws = wrapWebSocket(() => api.providers["ollama-proxy-ws"].$ws());
  ws.onMessage(async (message) => {
    if (message.type === 'request') {
      const body = message.body ?? null;
      try {
        const response = await fetch(message.url, {
          method: message.method,
          headers: message.headers ?? {},
          body: body,
        });
        const text = await response.text();
        const headers = Object.fromEntries(response.headers.entries());
        const statusCode = response.status;
        ws.send({
          type: 'response',
          id: message.id,
          body: text,
          headers,
          statusCode,
        });
      } catch (err) {
        ws.send({
          type: 'error',
          id: message.id,
          error: (err as any).toString(),
        });
      }
    }
  });
};


export const localOllamaProxyEnabled = ['true', '1'].includes(process.env.VITE_KATUKO_OLLAMA_USE_LOCAL_PROXY!);
