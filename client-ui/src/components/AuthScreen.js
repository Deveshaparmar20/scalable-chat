import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      console.log('Auth submit payload:', formData, 'isLogin:', isLogin);
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
  const { data } = await axios.post(`${API_URL}${endpoint}`, formData);

  // Store token and a chat display name derived from the email
  localStorage.setItem('token', data.token);
  const displayName = formData.email?.split('@')[0] || formData.email;
  localStorage.setItem('username', displayName);
      
      toast({
        title: isLogin ? 'Login successful' : 'Registration successful',
        status: 'success',
        duration: 2000,
      });

      // Navigate to chat
      navigate('/chat');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    }
  }, [formData, isLogin, navigate, toast]);

  return (
    <Container maxW="container.sm" py={10}>
      <VStack spacing={8}>
        <Heading>Chat App</Heading>
        <Text>A scalable real-time chat application</Text>

        <Box w="100%" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
          <Tabs isFitted variant="enclosed" onChange={(index) => setIsLogin(index === 0)}>
            <TabList mb="1em">
              <Tab>Login</Tab>
              <Tab>Register</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                    </FormControl>
                    <Button type="submit" colorScheme="blue" width="full">
                      Login
                    </Button>
                  </VStack>
                </form>
              </TabPanel>
              <TabPanel>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Email</FormLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                    </FormControl>
                    <Button type="submit" colorScheme="blue" width="full">
                      Register
                    </Button>
                  </VStack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
}