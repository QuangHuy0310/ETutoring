'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

// Create a context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// Custom hook to use the socket context
export const useSocket = () => useContext(SocketContext);
 
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Khởi tạo socket khi component mount
    const initSocket = () => {
      // Lấy token xác thực từ localStorage thay vì cookies
      let token = null;
      
      // Kiểm tra xem chúng ta có đang chạy trên client-side không
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('auth-token');
      }

      // Tạo socket instance với WebSocket transport, không sử dụng polling
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3008', {
        transports: ['websocket'], // Chỉ sử dụng WebSocket transport, không polling
        auth: token ? { token } : undefined, // Truyền token xác thực nếu có
        withCredentials: false, // Tắt cross-domain cookies vì chúng ta sử dụng localStorage
        autoConnect: true, // Tự động kết nối
        reconnectionAttempts: 5, // Thử kết nối lại 5 lần
      });

      // Socket event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected!');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected!');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Lưu socket instance vào state
      setSocket(socketInstance);

      return socketInstance;
    };

    // Khởi tạo socket
    const socketInstance = initSocket();

    // Dọn dẹp khi component unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []); // Mảng dependencies rỗng có nghĩa là chỉ chạy một lần khi mount

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};