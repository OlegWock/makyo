export const createTitlePrompt = (firstMessage: string) => {
  return `Given this message from user, you need to generate a title for this conversation. 
  Don't include any other text in your response, reply only with title for this conversation. 
  Don't wrap it in quotes.

  Don't you even date wrapping it in quotes. If you wrap it in quotation marks, one kitten will be hurt. Maybe two.
  It's in out best interest that you provide concise title for the chat WITHOUT QUOTATION MARKS.
  
  Message from user:
  ${firstMessage}
  
  Title:`;
} 
