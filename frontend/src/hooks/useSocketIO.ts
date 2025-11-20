// Legacy hook - use useChat instead
import { useChat } from './useChat';

// Compatibility wrapper for old useSocketIO calls
export const useSocketIO = () => {
  const chat = useChat();
  
  return {
    socket: null,
    isConnected: chat.isConnected,
    messages: [],
    joinConversation: chat.joinConversation,
    sendMessage: (conversationId: number, content: string) => {
      chat.sendMessage(conversationId, content);
    },
    markMessagesRead: () => {},
    getConversationMessages: () => {},
    onNewMessage: () => {},
    onJoinedConversation: () => {},
    onConversationMessages: () => {},
    onMessagesMarkedRead: () => {}
  };
};