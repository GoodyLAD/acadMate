import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ProjectChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  isMinimized: boolean;
  onMinimize: () => void;
}

const ProjectChatbot: React.FC<ProjectChatbotProps> = ({
  isOpen,
  onToggle,
  isMinimized,
  onMinimize,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content:
        "Hi! I'm your Student Achievement Platform assistant. I can help you with questions about uploading certificates, tracking achievements, understanding the point system, and using the platform features. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const systemPrompt = `You are a helpful assistant for a Student Achievement Platform. This platform helps students:

1. Upload and track academic certificates, course completions, and achievements
2. Earn points and level up based on their activities
3. Build a comprehensive digital portfolio
4. Connect with peers and see their achievements
5. Get faculty approval for uploaded documents

ONLY answer questions related to:
- How to upload certificates and documents
- Understanding the point system and levels
- Using the achievement tracking features
- Platform navigation and features
- Student dashboard functionality
- Profile management
- Social features and peer connections
- Faculty approval process
- Portfolio building
- Goal setting and tracking

DO NOT answer questions about:
- General programming or coding
- Other platforms or services
- Personal advice unrelated to the platform
- Technical support for other software
- General knowledge questions

If asked about something unrelated to the Student Achievement Platform, politely redirect them back to platform-related questions.

Keep responses concise, helpful, and focused on the platform features.`;

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization:
              'Bearer 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',
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Student Achievement Platform',
          },
          body: JSON.stringify({
            model: 'microsoft/wizardlm-2-8x22b',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content,
              })),
              { role: 'user', content: inputMessage },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content:
          data.choices[0]?.message?.content ||
          'Sorry, I could not process your request.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setError('Failed to get response. Please try again.');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content:
          'Sorry, I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content:
          "Hi! I'm your Student Achievement Platform assistant. I can help you with questions about uploading certificates, tracking achievements, understanding the point system, and using the platform features. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-80' : 'w-96'} transition-all duration-300`}
    >
      <Card className='shadow-2xl border-2'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='p-2 bg-blue-500 rounded-full'>
                <Bot className='h-4 w-4 text-white' />
              </div>
              <div>
                <CardTitle className='text-sm'>Platform Assistant</CardTitle>
                <Badge variant='secondary' className='text-xs'>
                  Student Achievement Platform
                </Badge>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={onMinimize}
                className='h-6 w-6 p-0'
              >
                {isMinimized ? (
                  <Maximize2 className='h-3 w-3' />
                ) : (
                  <Minimize2 className='h-3 w-3' />
                )}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={onToggle}
                className='h-6 w-6 p-0'
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className='p-0'>
            <ScrollArea className='h-80 px-4'>
              <div className='space-y-4 py-2'>
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <div className='p-1 bg-blue-100 rounded-full'>
                        <Bot className='h-3 w-3 text-blue-600' />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className='whitespace-pre-wrap'>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.type === 'user'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.type === 'user' && (
                      <div className='p-1 bg-gray-100 rounded-full'>
                        <User className='h-3 w-3 text-gray-600' />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className='flex gap-2 justify-start'>
                    <div className='p-1 bg-blue-100 rounded-full'>
                      <Bot className='h-3 w-3 text-blue-600' />
                    </div>
                    <div className='bg-gray-100 p-3 rounded-lg'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                    </div>
                  </div>
                )}

                {error && (
                  <div className='flex gap-2 justify-start'>
                    <div className='p-1 bg-red-100 rounded-full'>
                      <AlertCircle className='h-3 w-3 text-red-600' />
                    </div>
                    <div className='bg-red-50 p-3 rounded-lg text-red-700 text-sm'>
                      {error}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className='p-4 border-t'>
              <div className='flex gap-2'>
                <Input
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Ask about the platform...'
                  disabled={isLoading}
                  className='flex-1'
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size='sm'
                >
                  <Send className='h-4 w-4' />
                </Button>
              </div>
              <div className='flex justify-between items-center mt-2'>
                <p className='text-xs text-gray-500'>
                  Ask about certificates, achievements, points, or platform
                  features
                </p>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearChat}
                  className='text-xs h-6 px-2'
                >
                  Clear Chat
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ProjectChatbot;
