import { ApiClient, useApiClient } from "@client/api";
import { Loading } from "@client/components/Loading";
import type { ProxyResponseMessageType, ProxyRequestMessageType } from "@shared/ollama-proxy";
import { ReactNode, useEffect, useState } from "react";

const bufferToBase64 = async (buffer: Uint8Array) => {
  const base64url = await new Promise<string>(r => {
    const reader = new FileReader()
    reader.onload = () => r(reader.result as string)
    reader.readAsDataURL(new Blob([buffer]))
  });
  // remove the `data:...;base64,` part from the start
  return base64url.slice(base64url.indexOf(',') + 1);
};

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
      const message = JSON.parse(e.data) as ProxyRequestMessageType;
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
      isConnected = false;
      setTimeout(() => {
        ws = factory();
        initializeSocket(ws);
      }, 100);
    };

    socket.onopen = () => {
      isConnected = true;
      connectHandlers.forEach(cb => {
        try {
          cb();
        } catch (err) {
          console.log(err);
        }
      });
    }
  };

  let isConnected = false;
  const messageHandlers = new Set<(message: ProxyRequestMessageType) => void>();
  const connectHandlers = new Set<VoidFunction>();
  const outgoingMessagesQueue: ProxyResponseMessageType[] = [];
  let ws = factory();
  initializeSocket(ws);

  return {
    onMessage: (cb: (message: ProxyRequestMessageType) => void) => {
      messageHandlers.add(cb);

      return () => {
        messageHandlers.delete(cb);
      };
    },
    onConnect: (cb: VoidFunction) => {
      connectHandlers.add(cb);
      if (isConnected) {
        try {
          cb();
        } catch (err) {
          console.log(err);
        }
      }

      return () => {
        connectHandlers.delete(cb);
      };
    },
    send: (message: ProxyResponseMessageType) => {
      outgoingMessagesQueue.push(message);
      flushQueue();
    },

  };
}

export const initiateLocalOllamaProxy = (api: ApiClient) => {
  console.log('Initiating local Ollama proxy');
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

        const headers = Object.fromEntries(response.headers.entries());
        const statusCode = response.status;
        ws.send({
          type: 'response-init',
          id: message.id,
          headers,
          statusCode,
        });

        let responseText = '';
        if (response.body) {
          let responseBuffer: Uint8Array = new Uint8Array(0);
          const reader = response.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const newArrayBuffer = new Uint8Array(responseBuffer.length + value.length);
            newArrayBuffer.set(responseBuffer);
            newArrayBuffer.set(value, responseBuffer.length);
            responseBuffer = newArrayBuffer;

            const base64Str = await bufferToBase64(value);
            ws.send({
              type: 'response-chunk',
              id: message.id,
              chunk: base64Str,
            });
          }

          responseText = await new Response(responseBuffer).text();
        }

        ws.send({
          type: 'response',
          id: message.id,
          body: responseText,
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

  return new Promise<void>((resolve) => {
    ws.onConnect(() => resolve());
  });
};


export const localOllamaProxyEnabled = ['true', '1'].includes(import.meta.env.VITE_MAKYO_OLLAMA_USE_LOCAL_PROXY!);

export const LocalOllamaProxyProvider = ({ children }: { children: ReactNode }) => {
  const api = useApiClient();
  const [isProxyConnected, setIsProxyConnected] = useState(false);

  useEffect(() => {
    console.log('Is local Ollama proxy enabled', localOllamaProxyEnabled);
    if (localOllamaProxyEnabled) {
      initiateLocalOllamaProxy(api).then(() => {
        setIsProxyConnected(true);
      });
    }
  }, [api]);

  if (!localOllamaProxyEnabled || isProxyConnected) {
    return <>{children}</>;
  }

  return <Loading />;
};
