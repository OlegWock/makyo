export type ProxyRequestMessageType =
  { type: 'request', id: string, method: string, url: string, headers: Record<string, string>, body?: string };

export type ProxyResponseMessageType =
  | { type: 'response', id: string, body: string, headers: Record<string, string>, statusCode: number }
  | { type: 'response-init', id: string, headers: Record<string, string>, statusCode: number }
  | { type: 'response-chunk', id: string, chunk: string }
  | { type: 'error', id: string, error: string };
