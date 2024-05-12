import { ProxyRequestMessageType, ProxyResponseMessageType } from "@shared/ollama-proxy";
import { iife } from "@shared/utils";
import { WSContext, WSEvents } from "hono/ws";
import { v4 as uuid4 } from 'uuid';
import { decode } from "base64-arraybuffer";

type PromiseWithResolvers<T> = {
  promise: Promise<T>,
  resolve: (val: T) => void,
  reject: (err: any) => void,
};

const createPromiseWithResolvers = <T>(): PromiseWithResolvers<T> => {
  let resolve: any, reject: any;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve, reject };
};

const createStreamWithController = () => {
  let controller: ReadableStreamDefaultController<any> = null as any;
  const stream = new ReadableStream({
    start(_controller) {
      controller = _controller;
    },
  });
  return { stream, controller };
};

export const createProxiedFetch = () => {
  const controller = new AbortController();
  let ws: WSContext;
  const pendingPromises: Record<string, PromiseWithResolvers<Response>> = {};
  const pendingResponsesControllers: Record<string, ReadableStreamDefaultController<any>> = {};

  function proxiedFetch(request: Request, init?: RequestInit): Promise<Response>;
  function proxiedFetch(url: string | URL | Request, init?: FetchRequestInit): Promise<Response>;
  async function proxiedFetch(urlOrRequest: Request | string | URL, init?: RequestInit | FetchRequestInit): Promise<Response> {
    const id = uuid4();
    const url = typeof urlOrRequest === 'string' || urlOrRequest instanceof URL ? urlOrRequest.toString() : urlOrRequest.url;
    const params = typeof urlOrRequest === 'string' || urlOrRequest instanceof URL ? init : urlOrRequest;

    const headers = iife(() => {
      if (!params?.headers) return {};
      if (Array.isArray(params?.headers)) {
        return Object.fromEntries(params.headers);
      }
      if (params.headers instanceof Headers) {
        // @ts-ignore should be implemented, but lacking in types?
        return Object.fromEntries(params.headers.entries())
      }

      return params.headers;
    });
    const body = params?.body as string | undefined;

    pendingPromises[id] = createPromiseWithResolvers();
    console.log('Sending Ollama proxy message', url);
    ws.send(JSON.stringify({
      type: 'request',
      id,
      method: params?.method || 'GET',
      url,
      headers,
      body,
    } satisfies ProxyRequestMessageType));

    return pendingPromises[id].promise;
  }

  const handlers: WSEvents = {
    onOpen(evt, _ws) {
      ws = _ws;
    },
    onMessage(evt, ws) {
      const message = JSON.parse(evt.data as string) as ProxyResponseMessageType;
      const id = message.id;

      if (message.type === 'response') {
        if (!pendingResponsesControllers[id]) return;
        pendingResponsesControllers[id].close();
      } else if (message.type === 'error') {
        pendingPromises[id].reject(new Error(message.error));
      } else if (message.type === 'response-init') {
        const { stream, controller } = createStreamWithController();
        pendingResponsesControllers[id] = controller;
        const response = new Response(stream, {
          status: message.statusCode,
          headers: message.headers,
        });
        pendingPromises[id].resolve(response);
        delete pendingPromises[id];

      } else if (message.type === 'response-chunk') {
        if (!pendingResponsesControllers[id]) return;
        const buffer = decode(message.chunk);
        pendingResponsesControllers[id].enqueue(buffer);
      } else {
        console.log('Unknown WS message type', message);
        return;
      }
    },
    onClose(evt, ws) {
      controller.abort();
    },
    onError(evt, ws) {

    },
  };

  return { proxiedFetch, handlers, signal: controller.signal };
}

export const ollamaFetch = { current: null as null | ReturnType<typeof createProxiedFetch>["proxiedFetch"] };
