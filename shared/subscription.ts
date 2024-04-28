type SubscriptionMessageGeneric<N extends string, D extends Record<string, any>> = {
  type: N,
  data: D,
}

export type SubscriptionMessage =
  | SubscriptionMessageGeneric<"updateMessage", {
    messageId: number,
    chatId: number,
    text: string,
    isGenerating?: boolean,
  }>
  | SubscriptionMessageGeneric<"updateChat", {
    chatId: number,
    title?: string,
  }>
