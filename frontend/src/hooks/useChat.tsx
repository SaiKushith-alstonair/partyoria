import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: number;
  username: string;
  user_type: 'vendor' | 'customer';
  profile_picture?: string;
  display_name?: string;
}

interface Conversation {
  id: number;
  vendor: User;
  customer: User;
  last_message_at?: string;
  unread_count?: number;
  context?: any;
}

interface Message {
  id: number;
  message_id?: number;
  sender?: number;
  sender_id: number;
  sender_username: string;
  content: string;
  message_type: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  delivered_at?: string;
  read_at?: string;
  attachments?: any[];
  metadata?: any;
  retry_count?: number;
  temp_id?: string;
}

export const useChat = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<number, string[]>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get current user
  useEffect(() => {
    const authStorage = localStorage.getItem('auth-storage');
    const vendorProfile = localStorage.getItem('vendor_profile');
    
    let user = null;
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        user = parsed?.state?.user;
      } catch (e) {}
    }
    
    if (!user && vendorProfile) {
      try {
        const vendorData = JSON.parse(vendorProfile);
        user = {
          id: vendorData.id,
          username: vendorData.username || vendorData.email,
          user_type: 'vendor',
          display_name: vendorData.full_name
        };
      } catch (e) {}
    }
    
    setCurrentUser(user);
  }, []);

  // Initialize socket
  useEffect(() => {
    if (!currentUser) return;

    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token');
    
    if (!token) return;

    const newSocket = io('http://localhost:8001', {
      auth: { token },
      transports: ['websocket']
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    
    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => ({
        ...prev,
        [message.conversation_id]: [...(prev[message.conversation_id] || []), message]
      }));
    });

    newSocket.on('typing', ({ conversation_id, username, is_typing }) => {
      setTypingUsers(prev => {
        const current = prev[conversation_id] || [];
        if (is_typing) {
          return {
            ...prev,
            [conversation_id]: current.includes(username) ? current : [...current, username]
          };
        } else {
          return {
            ...prev,
            [conversation_id]: current.filter(u => u !== username)
          };
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/chat/conversations/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const token = localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/chat/conversations/${conversationId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => ({
          ...prev,
          [conversationId]: data
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const joinConversation = (conversationId: number) => {
    if (socket) {
      socket.emit('join_conversation', { conversation_id: conversationId });
    }
  };

  const sendMessage = (conversationId: number, content: string) => {
    if (socket) {
      socket.emit('send_message', {
        conversation_id: conversationId,
        content
      });
    }
  };

  const setTyping = (conversationId: number, isTyping: boolean) => {
    if (socket) {
      socket.emit('typing', {
        conversation_id: conversationId,
        is_typing: isTyping
      });
    }
  };

  const createConversation = async (vendorId: number, customerId: number) => {
    try {
      const token = localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      
      if (!token) return null;

      const response = await fetch('http://localhost:8000/api/chat/conversations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendor_id: vendorId,
          customer_id: customerId
        })
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [...prev, newConversation]);
        return newConversation;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    return null;
  };

  return {
    socket,
    isConnected,
    messages,
    conversations,
    typingUsers,
    currentUser,
    loadConversations,
    loadMessages,
    joinConversation,
    sendMessage,
    setTyping,
    createConversation
  };
};