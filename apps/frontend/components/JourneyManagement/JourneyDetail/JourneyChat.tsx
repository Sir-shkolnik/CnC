'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { MessageSquare, Send, Users, Clock, Phone } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  isOwn?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface JourneyChatProps {
  journeyId: string;
}

export const JourneyChat: React.FC<JourneyChatProps> = ({ journeyId }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Mike Wilson', message: 'Arrived at pickup location', time: '09:15 AM', status: 'read' },
    { id: '2', user: 'Sarah Johnson', message: 'Starting to load items', time: '09:20 AM', status: 'read' },
    { id: '3', user: 'Mike Wilson', message: 'All items loaded, heading out', time: '09:45 AM', status: 'read' },
    { id: '4', user: 'You', message: 'Great! Keep me updated on the route', time: '09:46 AM', isOwn: true, status: 'delivered' },
    { id: '5', user: 'Sarah Johnson', message: 'Traffic is light, should arrive on time', time: '10:00 AM', status: 'read' }
  ]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: newMessage,
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isOwn: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'delivered':
        return <div className="w-2 h-2 bg-blue-400 rounded-full" />;
      case 'read':
        return <div className="w-2 h-2 bg-green-400 rounded-full" />;
      default:
        return null;
    }
  };

  const onlineUsers = [
    { name: 'Mike Wilson', role: 'Driver', status: 'online' },
    { name: 'Sarah Johnson', role: 'Mover', status: 'online' },
    { name: 'David Chen', role: 'Mover', status: 'busy' }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-primary" />
          Crew Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Online Users */}
          <div className="p-3 bg-surface/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-text-primary flex items-center">
                <Users className="w-3 h-3 mr-1" />
                Online ({onlineUsers.filter(u => u.status === 'online').length})
              </h4>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Phone className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {onlineUsers.map((user, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${user.status === 'online' ? 'bg-success' : 'bg-warning'}
                  `} />
                  <span className="text-xs text-text-secondary">{user.name}</span>
                  {index < onlineUsers.length - 1 && (
                    <span className="text-xs text-text-secondary">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start space-x-3 ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isOwn ? 'bg-primary' : 'bg-secondary'}`}>
                  <span className="text-white font-semibold text-xs">
                    {message.user.charAt(0)}
                  </span>
                </div>
                
                {/* Message Content */}
                <div className={`flex-1 min-w-0 ${message.isOwn ? 'text-right' : ''}`}>
                  <div className={`flex items-center space-x-2 mb-1 ${message.isOwn ? 'justify-end' : ''}`}>
                    <p className="text-sm font-medium text-text-primary">{message.user}</p>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-text-secondary" />
                      <span className="text-xs text-text-secondary">{message.time}</span>
                    </div>
                  </div>
                  <div className={`relative inline-block max-w-xs sm:max-w-md lg:max-w-lg ${message.isOwn ? 'text-right' : 'text-left'}`}>
                    <div className={`p-3 rounded-lg ${message.isOwn ? 'bg-primary text-white' : 'bg-surface/50'}`}>
                      <p className="text-sm leading-relaxed">{message.message}</p>
                    </div>
                    {/* Message Status */}
                    {message.isOwn && message.status && (
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        {getStatusIcon(message.status)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex space-x-2 pt-4 border-t border-gray-700">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 bg-surface border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm pr-10"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="h-6 w-6 p-0"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Info */}
          <div className="text-center">
            <p className="text-xs text-text-secondary">
              Messages are end-to-end encrypted • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 