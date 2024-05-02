Idea is to allow proxying requests from backend (which might be hosted somewhere in cloud) through user's browser to services on user's local network.

This way, app can be hosted in cloud and have its own domain, but still be able to connect to local installation of Ollama without exposing user's machine to outside network + works with dynamic IPs.

### General process:
0. Each client should be given an unique ID which will be stored in cookie
1. User opens web app in browser
2. Web app creates a SharedWorker where it opens WebSocket connection to backend
3. Backend accepts connection and saves it along with client ID
4. When client makes a request to backend which involves calling Ollama, backend 
checks if it has proxy connection for this client and swaps `fetch` implementation 
for Ollama API client with proxied `fetch`.

### Request-response

Since there is no concept of request-response in WebSockets, we'll need to roll our own implementation.

0. When calling proxified `fetch`, our function will create and return a promise inside which it will send request
1. When sending a request, backend will generate unique UUIDv4 for it and attach it to request info. 
2. Proxy will receive WS message, make a request and await for response.
3. Then proxy will send message back with response and request id.
4. Backend will receive response and resolve original promise with response

**Note:** we need to handle streaming too
**Note:** later probably will need to handle binary data too
