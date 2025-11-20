import React, { useState, useEffect } from 'react';
import { Search, X, MessageCircle, Calendar, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface SearchResult {
  message: {
    id: number;
    content: string;
    created_at: string;
    sender_username: string;
    message_type: string;
  };
  conversation: {
    id: number;
    other_user: {
      id: number;
      username: string;
      display_name?: string;
      user_type: string;
    };
  };
}

interface ConversationSearchProps {
  onSelectConversation?: (conversationId: number) => void;
  onClose?: () => void;
}

export const ConversationSearch: React.FC<ConversationSearchProps> = ({
  onSelectConversation,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('chat_search_history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (searchQuery: string) => {
    const updated = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('chat_search_history', JSON.stringify(updated));
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Get token from Zustand first
      const authStorage = localStorage.getItem('auth-storage');
      let authToken = null;
      
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          authToken = parsed?.state?.tokens?.access;
        } catch (e) {
          console.error('Failed to parse auth-storage:', e);
        }
      }
      
      // Fallback to direct localStorage
      if (!authToken) {
        authToken = localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      }

      if (!authToken) return;

      const response = await fetch(
        `http://localhost:8000/api/chat/conversations/search/?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        saveToHistory(searchQuery);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleResultClick = (result: SearchResult) => {
    if (onSelectConversation) {
      onSelectConversation(result.conversation.id);
    }
    if (onClose) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) { // Less than 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardContent className="p-0">
          {/* Search Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <form onSubmit={handleSearch}>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search messages and conversations..."
                    className="pl-10 pr-4"
                    autoFocus
                  />
                </form>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search History */}
            {searchHistory.length > 0 && !query && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-1">
                  {searchHistory.map((term, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery(term);
                        performSearch(term);
                      }}
                      className="text-xs h-6"
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                <p>Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {result.conversation.other_user.display_name || 
                             result.conversation.other_user.username}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {result.conversation.other_user.user_type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(result.message.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          <span className="font-medium text-gray-800">
                            {result.message.sender_username}:
                          </span>{' '}
                          {highlightText(result.message.content, query)}
                        </p>
                        
                        {result.message.message_type !== 'text' && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {result.message.message_type}
                          </Badge>
                        )}
                      </div>
                      
                      <MessageCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages found for "{query}"</p>
                <p className="text-sm mt-1">Try different keywords or check spelling</p>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Search through all your conversations</p>
                <p className="text-sm mt-1">Find messages, files, and more</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};