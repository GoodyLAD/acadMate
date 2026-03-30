import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import ProjectChatbot from './ProjectChatbot';

const ChatbotToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={toggleChatbot}
        className='fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-500 hover:bg-blue-600'
        size='icon'
      >
        {isOpen ? (
          <X className='h-6 w-6' />
        ) : (
          <MessageCircle className='h-6 w-6' />
        )}
      </Button>

      {/* Chatbot Component */}
      <ProjectChatbot
        isOpen={isOpen}
        onToggle={toggleChatbot}
        isMinimized={isMinimized}
        onMinimize={toggleMinimize}
      />
    </>
  );
};

export default ChatbotToggle;
