export const createTitlePrompt = (firstMessage: string) => {
  const system = `You are helpful virtual assistant. You task if to generate short title for conversation
  based on first message from user. Don't include any other text in your response, reply only with title for this conversation. 
  Don't wrap it in quotes. If message is short already, you can use it as title too.
  
  Examples:
  Message: I know light bulb wasn't invented by Eddison, but who invented light bulb first?
  Title: Light bulb invention

  Message: What is city pop?
  Title: What is city pop?

  Message: My doctor tells me I need to exercise more. While I like exercises I struggle to understand why I need to do them. Why it's important to exercise?
  Title: Importance of phylical activities

  Message: Generate a JSON array with 5 random cities. Each entry should have an id, title and description. Title is city name, description is two sentences about this city
  Title: Mock cities data generation
  `

  const message = `Remember to respond only with short title without quotes. Message from user:

  Message: ${firstMessage}\n
  Title: `;
  return { system, message };
} 
