import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  VStack,
  HStack,
  Input,
  Text,
  Spinner,
  Avatar,
  Portal,
} from '@chakra-ui/react';
import { RiSendPlaneFill } from 'react-icons/ri';
import dynamic from 'next/dynamic';
import chatbotAnim from '@/assets/chatbot_message.json';
import { useTranslation } from 'next-i18next';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const MessageTextComponent = ({ text }: { text: string }) => {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Box key={i} minH="1em">
          {line.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
          })}
        </Box>
      ))}
    </>
  );
};

export default function HeaderAIChatbot() {
  const { t } = useTranslation('header');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your AI Assistant. How can I help you today?",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CHATBOT_FAQ_API}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content, session_id: 'header_session' }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to AI server');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let aiText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          aiText += chunkValue;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: aiText } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      closeOnBlur={false}
    >
      <PopoverTrigger>
        <IconButton
          aria-label="AI Chatbot"
          icon={
            <Box w="32px" h="32px" display="flex" alignItems="center" justifyContent="center">
              <Lottie animationData={chatbotAnim} loop={true} style={{ width: '100%', height: '100%' }} />
            </Box>
          }
          colorScheme="teal"
          variant={isOpen ? 'solid' : 'outline'}
          size="md"
          rounded="full"
          onClick={() => setIsOpen(!isOpen)}
        />
      </PopoverTrigger>
      <Portal>
        <PopoverContent zIndex={999} width="350px" boxShadow="2xl" borderRadius="lg" border="none">
          <PopoverArrow bg="gray.50" />
          <PopoverCloseButton />
        <PopoverHeader fontWeight="bold" borderBottomWidth="1px" pb={3} pt={3} bg="gray.50" borderTopRadius="lg">
          <HStack spacing={2}>
            <Box w="24px" h="24px">
              <Lottie animationData={chatbotAnim} loop={true} style={{ width: '100%', height: '100%' }} />
            </Box>
            <Text fontSize="md">AI Assistant</Text>
          </HStack>
        </PopoverHeader>
        <PopoverBody p={0}>
          <VStack h="400px" spacing={0}>
            <Box ref={scrollContainerRef} flex={1} w="full" overflowY="auto" p={4} css={{
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": { background: "gray.300", borderRadius: "24px" },
            }}>
              <VStack spacing={4} align="stretch">
                {messages.map((msg) => (
                  <HStack
                    key={msg.id}
                    alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                    alignItems="flex-start"
                    spacing={2}
                    maxW="90%"
                  >
                    {msg.role === 'assistant' && (
                      <Avatar size="xs" bg="transparent" icon={
                        <Box w="20px" h="20px">
                           <Lottie animationData={chatbotAnim} loop={true} style={{ width: '100%', height: '100%' }} />
                        </Box>
                      } />
                    )}
                    <Box
                      bg={msg.role === 'user' ? 'teal.500' : 'gray.100'}
                      color={msg.role === 'user' ? 'white' : 'gray.800'}
                      px={3}
                      py={2}
                      borderRadius="lg"
                      borderTopRightRadius={msg.role === 'user' ? 'sm' : 'lg'}
                      borderTopLeftRadius={msg.role === 'assistant' ? 'sm' : 'lg'}
                      fontSize="sm"
                      boxShadow="sm"
                    >
                      {msg.role === 'assistant' && msg.content === '' && isTyping ? (
                        <HStack spacing={1} h="20px" alignItems="center">
                          <Box as="span" className="typing-dot" bg="gray.500" w="4px" h="4px" borderRadius="full" animation="blink 1.4s infinite .2s"></Box>
                          <Box as="span" className="typing-dot" bg="gray.500" w="4px" h="4px" borderRadius="full" animation="blink 1.4s infinite .4s"></Box>
                          <Box as="span" className="typing-dot" bg="gray.500" w="4px" h="4px" borderRadius="full" animation="blink 1.4s infinite .6s"></Box>
                        </HStack>
                      ) : (
                        <MessageTextComponent text={msg.content} />
                      )}
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </Box>
            <Box w="full" p={3} borderTopWidth="1px" bg="white" borderBottomRadius="lg">
              <HStack>
                <Input
                  size="sm"
                  placeholder="Ask me anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  borderRadius="full"
                  bg="gray.50"
                  _focus={{ bg: "white", borderColor: "teal.400" }}
                  disabled={isTyping}
                />
                <IconButton
                  aria-label="Send message"
                  icon={isTyping ? <Spinner size="xs" /> : <RiSendPlaneFill />}
                  colorScheme="teal"
                  size="sm"
                  rounded="full"
                  onClick={handleSend}
                  isDisabled={!inputValue.trim() || isTyping}
                />
              </HStack>
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
      </Portal>
      <style>{`
        @keyframes blink {
          0% { opacity: 0.2; transform: scale(0.8); }
          20% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.2; transform: scale(0.8); }
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </Popover>
  );
}
