import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || '';
// Derive the base URL from API_URL by removing '/api' if it's there
const BASE_URL = API_URL.replace(/\/api$/, '') || window.location.origin;

/**
 * Hook to subscribe to Socket.io events.
 * Connects to the backend websocket and listens for a specific event.
 */
export function useRealtime<T>(
  event: string,
  callback: (payload: T) => void,
  room?: string
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(BASE_URL, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      // MED-11: Use the correct event name that matches the backend
      if (room) {
        socket.emit('subscribe_live_locations');
      }
    });

    socket.on(event, (payload: T) => {
      callback(payload);
    });

    return () => {
      socket.off(event);
      socket.disconnect();
    };
  }, [event, room]); // We intentionally leave callback out to avoid reconnects on every render, assuming callback handles state properly or is wrapped in useCallback

}
