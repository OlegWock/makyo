type SubscriptionMessageGeneric<N extends string, D extends Record<string, any>> = {
  type: N,
  data: D,
}

export type SubscriptionMessage =
  | SubscriptionMessageGeneric<"heartbeat", {}>
  | SubscriptionMessageGeneric<"updateMessage", {
    messageId: number,
    chatId: number,
    text: string,
    isGenerating?: boolean,
    error?: string,
  }>
  | SubscriptionMessageGeneric<"updateChat", {
    chatId: number,
    title?: string,
  }>
  | SubscriptionMessageGeneric<"updateModels", {}>
