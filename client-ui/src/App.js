import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthScreen } from './components/AuthScreen';
import { ChatScreen } from './components/ChatScreen';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
