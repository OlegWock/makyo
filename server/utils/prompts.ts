export const createTitlePrompt = (firstMessage: string) => {
  return `Given this message from user, you need to generate a title for this conversation. 
  Don't include any other text in your response, reply only with title for this conversation. 
  Don't wrap it in quotes.
  
  Message from user:
  ${firstMessage}
  
  Title:`;
} 
