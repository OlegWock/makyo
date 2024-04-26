type WSMessageGeneric<N extends string, D extends Record<string, any>> = {
  type: N,
  data: D,
}

export type WSMessage =
  | WSMessageGeneric<"updateMessage", {
    messageId: number,
    chatId: number,
    text: string,
    isGenerating?: boolean,
  }>
  | WSMessageGeneric<"updateChat", {
    chatId: number,
    title?: string,
  }>
