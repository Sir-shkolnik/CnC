'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import { Input } from '@/components/atoms/Input'
import { Badge } from '@/components/atoms/Badge'
import { 
  MessageSquare,
  Send,
  Paperclip,
  Camera,
  Smile,
  MoreVertical,
  User,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  File
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatMessage {
  id: string
  journeyId: string
  userId: string
  userName: string
  userRole: string
  content: string
  type: 'text' | 'image' | 'file' | 'location'
  timestamp: string
  status: 'sending' | 'sent' | 'delivered' | 'read'
  metadata?: {
    fileUrl?: string
    fileName?: string
    fileSize?: number
    location?: {
      lat: number
      lng: number
      address: string
    }
  }
}

interface User {
  id: string
  name: string
  role: string
  avatar?: string
}

interface RealTimeChatProps {
  journeyId: string
  currentUser: User
  onMessageSend: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) => Promise<void>
  onTypingIndicator?: (isTyping: boolean) => void
}

export default function RealTimeChat({
  journeyId,
  currentUser,
  onMessageSend,
  onTypingIndicator
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load initial messages
  useEffect(() => {
    loadChatHistory()
  }, [journeyId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    try {
      // TODO: Replace with API call
      setMessages([])
    } catch (error) {
      console.error('Failed to load chat history:', error)
      toast.error('Failed to load chat history')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const messageData = {
      journeyId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: newMessage.trim(),
      type: 'text' as const
    }

    setIsLoading(true)
    try {
      await onMessageSend(messageData)
      
      // Add message to local state immediately for optimistic UI
      const newMsg: ChatMessage = {
        id: `temp_${Date.now()}`,
        ...messageData,
        timestamp: new Date().toISOString(),
        status: 'sending'
      }
      setMessages(prev => [...prev, newMsg])
      
      setNewMessage('')
      setIsTyping(false)
      
      // Simulate message delivery
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMsg.id 
              ? { ...msg, status: 'sent' }
              : msg
          )
        )
      }, 1000)

      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMsg.id 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        )
      }, 2000)
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const messageData = {
      journeyId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: file.name,
      type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
      metadata: {
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size
      }
    }

    onMessageSend(messageData)
    event.target.value = ''
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (!isTyping) {
      setIsTyping(true)
      onTypingIndicator?.(true)
    }

    // Clear typing indicator after 2 seconds of no typing
    clearTimeout((window as any).typingTimeout)
    ;(window as any).typingTimeout = setTimeout(() => {
      setIsTyping(false)
      onTypingIndicator?.(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-text-secondary" />
      case 'sent':
        return <Check className="w-3 h-3 text-text-secondary" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-primary" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-success" />
      default:
        return <AlertCircle className="w-3 h-3 text-error" />
    }
  }

  const isOwnMessage = (message: ChatMessage) => message.userId === currentUser.id

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Journey Chat
          </div>
          <div className="flex items-center space-x-2">
            {typingUsers.length > 0 && (
              <span className="text-sm text-text-secondary">
                {typingUsers.join(', ')} typing...
              </span>
            )}
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md ${
                  isOwnMessage(message)
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-primary'
                } rounded-lg p-3`}
              >
                {/* Message Header */}
                {!isOwnMessage(message) && (
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {message.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">{message.userName}</p>
                      <p className="text-xs opacity-70">{message.userRole}</p>
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div className="space-y-2">
                  {message.type === 'text' && (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {message.type === 'image' && (
                    <div className="space-y-2">
                      <img
                        src={message.metadata?.fileUrl}
                        alt={message.content}
                        className="rounded-lg max-w-full h-auto"
                      />
                      <p className="text-xs opacity-70">{message.content}</p>
                    </div>
                  )}
                  
                  {message.type === 'file' && (
                    <div className="flex items-center space-x-2 p-2 bg-black/10 rounded">
                      <File className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{message.content}</p>
                        <p className="text-xs opacity-70">
                          {message.metadata?.fileSize ? 
                            `${(message.metadata.fileSize / 1024 / 1024).toFixed(1)} MB` : 
                            'Unknown size'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Footer */}
                <div className={`flex items-center justify-between mt-2 ${
                  isOwnMessage(message) ? 'text-white/70' : 'text-text-secondary'
                }`}>
                  <span className="text-xs">{formatTime(message.timestamp)}</span>
                  {isOwnMessage(message) && (
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(message.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-surface text-text-primary rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-xs text-text-secondary">
                    {typingUsers.join(', ')} typing...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={isLoading}
                className="border-0 focus:ring-0"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  )
} 