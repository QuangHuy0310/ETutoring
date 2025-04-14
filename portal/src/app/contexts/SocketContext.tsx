"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Chỉ khởi tạo socket ở phía client
    if (typeof window === 'undefined') return;
    
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;
    
    // Kết nối socket
    const socketInstance = io('http://localhost:3008', {
      transports: ['websocket'],
      auth: {
        token: accessToken
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