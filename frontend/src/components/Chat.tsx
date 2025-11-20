import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MessageStatus } from './MessageStatus';
import { FileAttachment } from './FileAttachment';
import { ConversationContextPanel } from './ConversationContextPanel';
import { QuickActionsToolbar } from './QuickActionsToolbar';
import { ConversationSearch } from './ConversationSearch';
import { ArrowLeft, Send, Search, MessageCircle, Users, Paperclip, MoreVertical } from 'lucide-react';

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

export const Chat: React.FC = () => {
  const {
    isConnected,
    conversations,
    messages,
    typingUsers,
    currentUser,
    loadConversations,
    loadMessages,
    joinConversation,
    sendMessage,
    setTyping,
    createConversation
  } = useChat();

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [messageSending, setMessageSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load initial data
  useEffect(() => {
    const init = async () => {
      await loadConversations();
      await loadAvailableUsers();
      setLoading(false);
    };
    
    if (currentUser) {
      init();
    }
  }, [currentUser]);

  // Listen for vendor chat open event
  useEffect(() => {
    const handleOpenVendorChat = (event: any) => {
      const { vendorName, vendorId } = event.detail;
      const vendor = availableUsers.find(u => u.id === vendorId || u.username === vendorName);
      if (vendor) {
        handleStartConversation(vendor);
      }
    };
    
    window.addEventListener('openVendorChat', handleOpenVendorChat);
    return () => window.removeEventListener('openVendorChat', handleOpenVendorChat);
  }, [availableUsers, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  // Join conversation when selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.id) {
      joinConversation(selectedConversation.id);
      loadConversationMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAvailableUsers = async () => {
    try {
      // Get token from Zustand first
      const authStorage = localStorage.getItem('auth-storage');
      let token = null;
      
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          token = parsed?.state?.tokens?.access;
        } catch (e) {
          console.error('Failed to parse auth-storage:', e);
        }
      }
      
      // Fallback to direct localStorage
      if (!token) {
        token = localStorage.getItem('access_token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('token');
      }
      
      if (!token) return;

      // For customers, only show vendors from bookings
      if (currentUser?.user_type === 'customer') {
        console.log('🔍 Loading vendors from bookings for customer:', currentUser.username);
        const bookingsResponse = await fetch('http://127.0.0.1:8000/api/vendor/bookings/customer/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 Bookings API response status:', bookingsResponse.status);
        if (bookingsResponse.ok) {
          const data = await bookingsResponse.json();
          console.log('📦 Bookings API data:', data);
          const bookings = Array.isArray(data) ? data : (data.bookings || data.results || []);
          console.log('📋 Processed bookings array:', bookings);
          // Extract unique vendors from bookings
          const vendorMap = new Map();
          bookings.forEach((booking: any) => {
            console.log('Processing booking:', booking);
            // Handle both nested vendor object and flat vendor fields
            const vendorId = booking.vendor?.id || booking.vendor_id;
            const vendorName = booking.vendor?.full_name || booking.vendor_name;
            const vendorEmail = booking.vendor?.email || booking.vendor_email;
            const vendorUsername = booking.vendor?.username || booking.vendor_username || vendorEmail?.split('@')[0];
            const vendorProfilePic = booking.vendor?.profile_picture || booking.vendor_profile_picture;
            
            if (vendorId && !vendorMap.has(vendorId)) {
              vendorMap.set(vendorId, {
                id: vendorId,
                username: vendorUsername || vendorEmail,
                user_type: 'vendor',
                display_name: vendorName || vendorUsername,
                profile_picture: vendorProfilePic
              });
            }
          });
          const vendors = Array.from(vendorMap.values());
          console.log('✅ Extracted vendors for chat:', vendors);
          console.log('📊 Total vendors available:', vendors.length);
          vendors.forEach(v => console.log(`  - ID: ${v.id}, Username: ${v.username}, Display: ${v.display_name}, Type: ${v.user_type}`));
          setAvailableUsers(vendors);
        } else {
          console.error('Bookings fetch failed:', bookingsResponse.status);
          setAvailableUsers([]);
        }
      } else {
        // For vendors, show all available users
        const response = await fetch('http://localhost:8000/api/chat/conversations/available_users/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const users = await response.json();
          setAvailableUsers(users);
        } else {
          console.error('Failed to load users:', response.status, await response.text());
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadConversationMessages = async (conversationId: number) => {
    setLoadingMessages(true);
    await loadMessages(conversationId);
    setLoadingMessages(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFiles) || !selectedConversation || !isConnected || messageSending) return;

    setMessageSending(true);
    const content = newMessage.trim();
    setNewMessage('');
    
    // Stop typing indicator
    setTyping(selectedConversation.id, false);
    
    try {
      // Send message with files if any
      if (selectedFiles && selectedFiles.length > 0) {
        await sendMessageWithFiles(selectedConversation.id, content, selectedFiles);
        setSelectedFiles(null);
      } else {
        sendMessage(selectedConversation.id, content);
      }
    } finally {
      setMessageSending(false);
    }
  };

  const sendMessageWithFiles = async (conversationId: number, content: string, files: FileList) => {
    try {
      const token = localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      
      const vendorProfile = localStorage.getItem('vendor_profile');
      let authToken = token;
      if (vendorProfile && !token) {
        const vendorData = JSON.parse(vendorProfile);
        if (vendorData.access_token) {
          authToken = vendorData.access_token;
        }
      }

      if (!authToken) return;

      const formData = new FormData();
      formData.append('conversation', conversationId.toString());
      formData.append('content', content);
      formData.append('message_type', 'file');
      
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      await fetch('http://localhost:8000/api/chat/messages/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
    } catch (error) {
      console.error('Error sending message with files:', error);
    }
  };

  const handleRetryMessage = async (messageId: number) => {
    try {
      const token = localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      
      const vendorProfile = localStorage.getItem('vendor_profile');
      let authToken = token;
      if (vendorProfile && !token) {
        const vendorData = JSON.parse(vendorProfile);
        if (vendorData.access_token) {
          authToken = vendorData.access_token;
        }
      }

      if (!authToken) return;

      await fetch(`http://localhost:8000/api/chat/messages/${messageId}/retry/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error retrying message:', error);
    }
  };

  const handleQuickAction = async (actionType: string, data: any) => {
    if (!selectedConversation) return;
    
    try {
      const token = localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      
      const vendorProfile = localStorage.getItem('vendor_profile');
      let authToken = token;
      if (vendorProfile && !token) {
        const vendorData = JSON.parse(vendorProfile);
        if (vendorData.access_token) {
          authToken = vendorData.access_token;
        }
      }

      if (!authToken) return;

      await fetch(`http://localhost:8000/api/chat/conversations/${selectedConversation.id}/quick_action/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action_type: actionType,
          ...data
        })
      });
    } catch (error) {
      console.error('Error performing quick action:', error);
    }
  };

  const handleClearMessages = async () => {
    if (!selectedConversation) return;
    
    if (confirm('Are you sure you want to clear your messages? This will only delete messages you sent.')) {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        let token = null;
        
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            token = parsed?.state?.tokens?.access;
          } catch (e) {}
        }
        
        if (!token) {
          token = localStorage.getItem('access_token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token');
        }
        
        const vendorProfile = localStorage.getItem('vendor_profile');
        if (vendorProfile && !token) {
          const vendorData = JSON.parse(vendorProfile);
          if (vendorData.access_token) {
            token = vendorData.access_token;
          }
        }

        if (!token) return;

        const response = await fetch(`http://localhost:8000/api/chat/conversations/${selectedConversation.id}/clear_my_messages/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await loadConversationMessages(selectedConversation.id);
        } else {
          console.error('Failed to clear messages:', response.status);
          alert('Failed to clear messages. Please try again.');
        }
      } catch (error) {
        console.error('Error clearing messages:', error);
        alert('Failed to clear messages. Please try again.');
      }
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!selectedConversation) return;
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing indicator
    if (value.trim()) {
      setTyping(selectedConversation.id, true);
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(selectedConversation.id, false);
      }, 3000);
    } else {
      setTyping(selectedConversation.id, false);
    }
  };

  const handleStartConversation = React.useCallback(async (user: User) => {
    if (!currentUser) return;
    
    const vendorId = currentUser.user_type === 'vendor' ? currentUser.id : user.id;
    const customerId = currentUser.user_type === 'customer' ? currentUser.id : user.id;
    
    // Check if conversation already exists
    const existing = conversations.find(conv => 
      conv.vendor.id === vendorId && conv.customer.id === customerId
    );
    
    if (existing) {
      setSelectedConversation(existing);
    } else {
      const newConv = await createConversation(vendorId, customerId);
      if (newConv) {
        setSelectedConversation(newConv);
      }
    }
    
    setShowUserList(false);
  }, [currentUser, conversations, createConversation]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  const getOtherUser = (conversation: Conversation) => {
    return currentUser?.id === conversation.vendor.id ? conversation.customer : conversation.vendor;
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherUser(conv);
    const displayName = otherUser.display_name || otherUser.username || '';
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const conversationMessages = selectedConversation ? messages[selectedConversation.id] || [] : [];
  const currentTyping = selectedConversation ? typingUsers[selectedConversation.id] || [] : [];

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div>Loading chat...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex">
      {/* Search Modal */}
      {showSearch && (
        <ConversationSearch
          onSelectConversation={(id) => {
            const conv = conversations.find(c => c.id === id);
            if (conv) setSelectedConversation(conv);
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-80 border-r`}>
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🔄 Toggling user list. Current:', showUserList, '→ New:', !showUserList);
                    console.log('📋 Available users:', availableUsers);
                    setShowUserList(!showUserList);
                  }}
                >
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {showUserList ? (
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
                  Start New Conversation
                </div>
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>No users available</p>
                  </div>
                ) : (
                  availableUsers.map(user => (
                    <div
                      key={`user-${user.id}`}
                      className="p-4 cursor-pointer hover:bg-muted border-b"
                      onClick={() => handleStartConversation(user)}
                    >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.profile_picture} />
                        <AvatarFallback>{(user.display_name || user.username || 'U')[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.display_name || user.username}</p>
                        <Badge variant="secondary" className="text-xs">
                          {user.user_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Click the users icon to start chatting</p>
                  </div>
                ) : (
                  filteredConversations.map(conversation => {
                    const otherUser = getOtherUser(conversation);
                    return (
                      <div
                        key={`conv-${conversation.id}`}
                        className={`p-4 cursor-pointer transition-colors border-b hover:bg-muted ${
                          selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={otherUser.profile_picture} />
                            <AvatarFallback>{(otherUser.display_name || otherUser.username || 'U')[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{otherUser.display_name || otherUser.username}</p>
                              {conversation.last_message_at && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conversation.last_message_at)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {otherUser.user_type}
                              </Badge>
                              {conversation.unread_count && conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1`}>
        {selectedConversation ? (
          <Card className="h-full rounded-none border-0 flex flex-col">
            <CardHeader className="border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                {(() => {
                  const otherUser = getOtherUser(selectedConversation);
                  return (
                    <>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherUser.profile_picture} />
                        <AvatarFallback>{(otherUser.display_name || otherUser.username || 'U')[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{otherUser.display_name || otherUser.username}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {otherUser.user_type}
                        </Badge>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearMessages}
                        title="Clear all messages"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </>
                  );
                })()}
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="text-center text-muted-foreground">Loading messages...</div>
                ) : conversationMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  conversationMessages.map(message => {
                    // Use consistent sender identification - check sender field first
                    const isOwnMessage = message.sender === currentUser?.id || 
                                        message.sender_id === currentUser?.id || 
                                        message.sender_username === currentUser?.username;
                    
                    return (
                      <div
                        key={message.message_id || message.id}
                        className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Receiver avatar - only show for received messages */}
                        {!isOwnMessage && (
                          <Avatar className="w-8 h-8 mr-3 flex-shrink-0">
                            <AvatarImage src={getOtherUser(selectedConversation).profile_picture} />
                            <AvatarFallback className="text-xs bg-gray-300">
                              {(getOtherUser(selectedConversation).display_name || getOtherUser(selectedConversation).username || 'U')[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                            : 'bg-white border text-gray-900 rounded-bl-sm'
                        }`}>
                          {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}
                          
                          {/* File Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2">
                              <FileAttachment attachments={message.attachments} />
                            </div>
                          )}
                          
                          <div className={`flex items-center gap-2 mt-1 ${
                            isOwnMessage ? 'text-purple-100' : 'text-gray-500'
                          }`}>
                            <p className="text-xs">
                              {formatTime(message.created_at)}
                            </p>
                            {isOwnMessage && (
                              <MessageStatus 
                                status={message.status}
                                onRetry={() => handleRetryMessage(message.id)}
                                retryCount={message.retry_count}
                              />
                            )}
                          </div>
                        </div>
                        
                        {/* Sender avatar - only show for sent messages */}
                        {isOwnMessage && (
                          <Avatar className="w-8 h-8 ml-3 flex-shrink-0">
                            <AvatarImage src={currentUser?.profile_picture} />
                            <AvatarFallback className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                              {(currentUser?.username || 'U')[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })
                )}
                
                {/* Typing indicator */}
                {currentTyping.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg">
                      <p className="text-sm italic">
                        {currentTyping.join(', ')} {currentTyping.length === 1 ? 'is' : 'are'} typing...
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* File Preview */}
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="border-t p-3 bg-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Paperclip className="h-4 w-4" />
                    <span>{selectedFiles.length} file(s) selected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFiles(null)}
                      className="ml-auto h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <QuickActionsToolbar
                userType={currentUser?.user_type || 'customer'}
                onSendQuote={(data) => handleQuickAction('send_quote', { quote_data: data })}
                onUpdateBooking={(status, data) => handleQuickAction('update_booking', { status, booking_data: data })}
                onScheduleCall={() => console.log('Schedule call')}
                onSharePortfolio={() => console.log('Share portfolio')}
              />

              {/* Message Input */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="mb-2">
                  <FileAttachment onFileSelect={setSelectedFiles} />
                </div>
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                    className="flex-1"
                    maxLength={1000}
                  />
                  <Button 
                    type="submit" 
                    disabled={(!newMessage.trim() && !selectedFiles) || !isConnected || messageSending}
                  >
                    {messageSending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full rounded-none border-0">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a conversation</p>
                <p className="text-sm">Choose a conversation to start messaging</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};