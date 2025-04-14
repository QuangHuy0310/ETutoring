"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Socket, io } from 'socket.io-client';
import { getCookie } from 'cookies-next';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    // Lấy token từ cookie thay vì hardcode hoặc từ localStorage
    const token = getCookie('accessToken');
    
    if (!token) {
      console.error('No access token available for socket connection');
      return;
    }

    const socketInstance = io('http://localhost:3008', {
      transports: ['websocket'],
      auth: {
        token: token
      },
      query: {
        token: token
      }
    });
    
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });
    
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  
  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};