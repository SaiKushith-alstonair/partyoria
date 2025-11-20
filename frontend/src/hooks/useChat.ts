import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  id: number;
  username: string;
  user_type: 'vendor' | 'customer';
  profile_picture?: string;
}

interface Message {
  id: number;
  message_id: string;
  conversation_id: number;
  sender_id: number;
  sender_username: string;
  sender_type: string;
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

interface Conversation {
  id: number;
  vendor: User;
  customer: User;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  unread_count?: number;
}

interface ChatState {
  isConnected: boolean;
  conversations: Conversation[];
  messages: { [conversationId: number]: Message[] };
  typingUsers: { [conversationId: number]: string[] };
  currentUser: User | null;
}

export const useChat = () => {
  const socket = useRef<Socket | null>(null);
  const [state, setState] = useState<ChatState>({
    isConnected: false,
    conversations: [],
    messages: {},
    typingUsers: {},
    currentUser: null
  });
  
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Get auth token with refresh
  const getAuthToken = useCallback(async () => {
    // Try Zustand auth-storage first
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.tokens?.access;
        if (token) return token;
      } catch (e) {
        console.error('Failed to parse auth-storage:', e);
      }
    }
    
    // Check vendor profile
    const vendorProfile = localStorage.getItem('vendor_profile');
    if (vendorProfile) {
      try {
        const vendorData = JSON.parse(vendorProfile);
        if (vendorData.access_token) {
          return vendorData.access_token;
        }
      } catch (e) {
        console.error('Failed to parse vendor_profile:', e);
      }
    }
    
    // Fallback to direct localStorage
    let token = localStorage.getItem('access_token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('token') || 
                sessionStorage.getItem('access_token') ||
                sessionStorage.getItem('authToken') ||
                sessionStorage.getItem('token');
    
    return token;
  }, []);

  // Get current user
  const getCurrentUser = useCallback((): User | null => {
    // Try Zustand auth-storage first
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const user = parsed?.state?.user;
        if (user) {
          return {
            id: user.chat_user_id || user.id,
            username: user.full_name || user.username || user.email,
            user_type: user.user_type || 'customer',
            profile_picture: user.profile_picture
          };
        }
      } catch (e) {
        console.error('Failed to parse auth-storage:', e);
      }
    }
    
    // Try vendor_profile (vendors)
    let userStr = localStorage.getItem('vendor_profile') || 
                  sessionStorage.getItem('vendor_profile');
    
    if (userStr) {
      try {
        const vendorData = JSON.parse(userStr);
        return {
          id: vendorData.chat_user_id || vendorData.id,
          username: vendorData.full_name || vendorData.username || vendorData.email,
          user_type: 'vendor',
          profile_picture: vendorData.profile_picture
        };
      } catch (e) {
        console.error('Failed to parse vendor_profile:', e);
      }
    }
    
    // Try partyoria_user (customers)
    userStr = localStorage.getItem('partyoria_user') || 
              sessionStorage.getItem('partyoria_user');
    
    if (userStr) {
      try {
        const customerData = JSON.parse(userStr);
        return customerData;
      } catch (e) {
        console.error('Failed to parse partyoria_user:', e);
      }
    }
    return null;
  }, []);

  // Connect to socket
  const connect = useCallback(async () => {
    const token = await getAuthToken();
    const user = getCurrentUser();
    
    if (!token || !user) {
      console.warn('No auth token or user data found', { token: !!token, user: !!user });
      return;
    }

    if (socket.current?.connected) {
      console.log('Socket already connected, skipping');
      return;
    }

    // Disconnect existing socket first
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }

    console.log('Connecting to chat server as:', user.user_type, user.username);
    
    socket.current = io('http://localhost:8001', {
      query: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    socket.current.on('connect', () => {
      console.log('Chat connected');
      reconnectAttempts.current = 0;
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        currentUser: user 
      }));
    });

    socket.current.on('disconnect', (reason) => {
      console.log('Chat disconnected:', reason);
      setState(prev => ({ ...prev, isConnected: false }));
      
      // Auto-reconnect with exponential backoff
      if (reason === 'io server disconnect') {
        // Server disconnected, don't reconnect
        return;
      }
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.pow(2, reconnectAttempts.current) * 1000;
        setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      }
    });

    socket.current.on('connected', (data) => {
      console.log('Server confirmed connection:', data);
    });

    socket.current.on('new_message', (message: Message) => {
      setState(prev => {
        const existingMessages = prev.messages[message.conversation_id] || [];
        
        // Check for temp message to replace
        const tempId = message.temp_id;
        let updatedMessages = [...existingMessages];
        
        if (tempId) {
          // Replace temp message with real message
          const tempIndex = updatedMessages.findIndex(m => m.message_id === tempId);
          if (tempIndex !== -1) {
            updatedMessages[tempIndex] = { ...message };
            return {
              ...prev,
              messages: {
                ...prev.messages,
                [message.conversation_id]: updatedMessages
              }
            };
          }
        }
        
        // Prevent duplicate messages
        if (existingMessages.some(m => m.id === message.id || m.message_id === message.message_id)) {
          return prev;
        }
        
        // Mark message as delivered if it's from another user
        const updatedMessage = { ...message };
        if (message.sender_id !== prev.currentUser?.id && message.status === 'sent') {
          updatedMessage.status = 'delivered';
        }
        
        // Update conversation list - move to top and update unread count
        const updatedConversations = prev.conversations.map(conv => {
          if (conv.id === message.conversation_id) {
            return {
              ...conv,
              last_message_at: message.created_at,
              unread_count: message.sender_id !== prev.currentUser?.id 
                ? (conv.unread_count || 0) + 1 
                : conv.unread_count
            };
          }
          return conv;
        }).sort((a, b) => {
          const aTime = new Date(a.last_message_at || a.created_at).getTime();
          const bTime = new Date(b.last_message_at || b.created_at).getTime();
          return bTime - aTime;
        });
        
        return {
          ...prev,
          conversations: updatedConversations,
          messages: {
            ...prev.messages,
            [message.conversation_id]: [
              ...existingMessages,
              updatedMessage
            ].slice(-100)
          }
        };
      });
    });

    socket.current.on('user_typing', (data) => {
      const { conversation_id, user_id, username, is_typing } = data;
      setState(prev => {
        const currentTyping = prev.typingUsers[conversation_id] || [];
        let newTyping;
        
        if (is_typing) {
          newTyping = currentTyping.includes(username) 
            ? currentTyping 
            : [...currentTyping, username];
        } else {
          newTyping = currentTyping.filter(u => u !== username);
        }
        
        return {
          ...prev,
          typingUsers: {
            ...prev.typingUsers,
            [conversation_id]: newTyping
          }
        };
      });
    });

    socket.current.on('error', (error) => {
      // Only log actual errors, not empty objects
      if (error && Object.keys(error).length > 0) {
        console.error('Socket error:', error);
      }
    });

  }, [getAuthToken, getCurrentUser]);

  // Initialize connection
  useEffect(() => {
    const timer = setTimeout(() => {
      connect();
    }, 100); // Small delay to prevent double connections
    
    return () => {
      clearTimeout(timer);
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [connect]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) return [];

      const response = await fetch('http://localhost:8000/api/chat/conversations/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const conversations = data.results || data;
        setState(prev => ({ ...prev, conversations }));
        return conversations;
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    return [];
  }, [getAuthToken]);

  // Load messages for conversation
  const loadMessages = useCallback(async (conversationId: number, page = 1) => {
    try {
      const token = await getAuthToken();
      if (!token) return { messages: [], hasNext: false };

      const response = await fetch(
        `http://localhost:8000/api/chat/conversations/${conversationId}/messages/?page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const messages = (data.results || []).map((msg: any) => ({
          ...msg,
          conversation_id: msg.conversation || msg.conversation_id
        }));
        
        setState(prev => ({
          ...prev,
          messages: {
            ...prev.messages,
            [conversationId]: page === 1 ? messages : [
              ...messages,
              ...(prev.messages[conversationId] || [])
            ]
          }
        }));
        
        return { messages, hasNext: data.has_next };
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    return { messages: [], hasNext: false };
  }, [getAuthToken]);

  // Join conversation
  const joinConversation = useCallback((conversationId: number) => {
    if (socket.current?.connected) {
      socket.current.emit('join_conversation', { conversation_id: conversationId });
    }
  }, []);

  // Send message
  const sendMessage = useCallback((conversationId: number, content: string) => {
    if (socket.current?.connected && content.trim()) {
      const tempId = `temp_${Date.now()}`;
      
      // Add optimistic message
      setState(prev => {
        const existingMessages = prev.messages[conversationId] || [];
        const optimisticMessage: Message = {
          id: 0,
          message_id: tempId,
          conversation_id: conversationId,
          sender_id: prev.currentUser?.id || 0,
          sender_username: prev.currentUser?.username || '',
          sender_type: prev.currentUser?.user_type || 'customer',
          content: content.trim(),
          message_type: 'text',
          status: 'sending',
          created_at: new Date().toISOString(),
          retry_count: 0
        };
        
        return {
          ...prev,
          messages: {
            ...prev.messages,
            [conversationId]: [...existingMessages, optimisticMessage]
          }
        };
      });
      
      socket.current.emit('send_message', {
        conversation_id: conversationId,
        content: content.trim(),
        temp_id: tempId
      });
    }
  }, []);

  // Send typing indicator
  const setTyping = useCallback((conversationId: number, isTyping: boolean) => {
    if (socket.current?.connected) {
      socket.current.emit('typing', {
        conversation_id: conversationId,
        is_typing: isTyping
      });
    }
  }, []);

  // Create conversation
  const createConversation = useCallback(async (vendorId: number, customerId: number) => {
    try {
      const token = await getAuthToken();
      if (!token) return null;

      const response = await fetch('http://localhost:8000/api/chat/conversations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendor: vendorId,
          customer: customerId
        })
      });

      if (response.ok) {
        const conversation = await response.json();
        setState(prev => ({
          ...prev,
          conversations: [conversation, ...prev.conversations]
        }));
        return conversation;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    return null;
  }, [getAuthToken]);

  // Update message status
  const updateMessageStatus = useCallback(async (messageId: number, status: string) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      await fetch(`http://localhost:8000/api/chat/messages/${messageId}/update_status/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }, [getAuthToken]);

  return {
    ...state,
    connect,
    loadConversations,
    loadMessages,
    joinConversation,
    sendMessage,
    setTyping,
    createConversation,
    updateMessageStatus
  };
};