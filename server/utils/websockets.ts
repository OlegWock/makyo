import { createBunWebSocket } from "hono/bun";

const { upgradeWebSocket, websocket } = createBunWebSocket();

// There is some problem with not exported types from Hono which doesn't let us export websocket without any
export const bunWebSocket: any = websocket;
export { upgradeWebSocket };
