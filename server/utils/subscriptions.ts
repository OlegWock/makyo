import { SubscriptionMessage } from "@shared/subscription";
import { iife } from "@shared/utils";
import { EventEmitter } from 'node:events';

export const sseEmitter = iife(() => {
  class ServerSentEventsEmitter extends EventEmitter {};

  return new ServerSentEventsEmitter();
});


export const broadcastSubscriptionMessage = (message: SubscriptionMessage) => {
  const serialized = JSON.stringify(message);
  sseEmitter.emit('message', serialized);
};
