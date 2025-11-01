import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  Text,
  VStack,
  useToast,
  Heading,
  Spacer,
  HStack,
} from '@chakra-ui/react';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3003';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [roomId] = useState('general'); // For now, use a default room
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/messages/history/${roomId}`);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: 'Error fetching chat history',
        status: 'error',
        duration: 3000,
      });
    }
  }, [roomId, toast]);

  useEffect(() => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (!username || !token) {
      navigate('/');
      return;
    }

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
        username,
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      // Join by room id string (server expects a string). Previously we sent an object
      // which caused the server to join the wrong room (e.g. '[object Object]').
      console.log('Emitting joinRoom for', roomId);
      newSocket.emit('joinRoom', roomId);
    });

    newSocket.on('receiveMessage', (msg) => {
      console.log('Received message via socket:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to connect to chat server',
        status: 'error',
        duration: 3000,
      });
    });

    setSocket(newSocket);

    // Fetch message history
    fetchHistory();

    return () => {
      newSocket.close();
    };
  }, [navigate, roomId, toast, fetchHistory]);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    if (!socket) return;

    const username = localStorage.getItem('username');
    socket.emit('sendMessage', {
      roomId,
      userId: username, // Using username as userId for simplicity
      username,
      text: message,
      timestamp: new Date().toISOString(),
    });

    setMessage('');
  }, [message, roomId, socket]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  }, [navigate]);

  return (
    <Container maxW="container.md" h="100vh" py={4}>
      <VStack h="full" spacing={4}>
        <HStack w="full">
          <Heading size="md">Chat Room: {roomId}</Heading>
          <Spacer />
          <Button onClick={handleLogout} size="sm" colorScheme="red">
            Logout
          </Button>
        </HStack>

        <Box
          flex={1}
          w="full"
          p={4}
          borderWidth={1}
          borderRadius="lg"
          overflowY="auto"
        >
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              mb={2}
              p={2}
              bg={msg.username === localStorage.getItem('username') ? 'blue.100' : 'gray.100'}
              borderRadius="md"
            >
              <Text fontWeight="bold">{msg.username}</Text>
              <Text>{msg.text}</Text>
              <Text fontSize="xs" color="gray.500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Text>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Flex w="full">
          <Input
            flex={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            mr={2}
          />
          <Button onClick={handleSend} colorScheme="blue">
            Send
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
}