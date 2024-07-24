import type { SubscriptionMessage } from "@shared/subscription";
import { iife } from "@shared/utils";
import { EventEmitter } from 'node:events';

export const sseEmitter = iife(() => {
  class ServerSentEventsEmitter extends EventEmitter {};

  const emmiter = new ServerSentEventsEmitter();
  emmiter.setMaxListeners(200);
  return emmiter;
});


export const broadcastSubscriptionMessage = (message: SubscriptionMessage) => {
  const serialized = JSON.stringify(message);
  // console.log('Emitting subscription message', message);
  sseEmitter.emit('message', serialized);
};
