import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Message } from "@/lib/types";

// Initialize the Google Generative AI client
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Check if we're running in the browser or server
const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  // Use NEXT_PUBLIC_ prefix for client-side environment variables
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

  if (API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(API_KEY);
      // Using a model that is confirmed to work with the current API version
      model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } catch (error) {
      console.error("Failed to initialize Google Generative AI:", error);
    }
  } else {
    console.warn(
      "NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY is not set in environment variables"
    );
  }
}

export async function generateChatResponse(
  messages: Message[],
  userMessage: string
): Promise<string> {
  // Fallback response if AI is not available
  if (!model) {
    return "I'm sorry, but the AI assistant is currently unavailable. Please try again later.";
  }

  try {
    // Construct the conversation history for context
    let conversationHistory =
      "You are a helpful and friendly AI assistant for a community platform where people donate and request items. Please provide helpful responses to user queries while being concise and friendly.\n\n";

    messages.forEach((message) => {
      const role = message.senderId === "ai-assistant" ? "AI" : "User";
      conversationHistory += `${role}: ${message.text}\n`;
    });

    // Add the new user message
    conversationHistory += `User: ${userMessage}\nAI:`;

    const result = await model.generateContent(conversationHistory);
    const response = await result.response;
    const text = response.text();

    return (
      text.trim() ||
      "I'm not sure how to respond to that. Could you ask me something else?"
    );
  } catch (error: any) {
    console.error("Error generating AI response:", error);

    // Handle specific error cases
    if (error.message?.includes("API_KEY")) {
      return "I'm sorry, but the AI assistant is not properly configured. Please contact the administrator.";
    }

    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
}
