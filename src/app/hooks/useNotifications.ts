


import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface DeliveryNotification {
  type: 'new_delivery' | 'status_update' | 'assignment';
  delivery: any;
  message: string;
}

export const useNotifications = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/sound.mp3');
    // audioRef.current = new Audio('');
    audioRef.current.volume = 0.7;

    // Ask for browser notification permission if not decided yet
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    // Setup WebSocket or EventSource for real-time notifications
    // Using EventSource for Server-Sent Events
    const eventSource = new EventSource('/api/notifications/stream');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const notification: DeliveryNotification = JSON.parse(event.data);
        
        // Play sound for new deliveries
        if (notification.type === 'new_delivery') {
          playNotificationSound();
          toast.success(notification.message, {
            duration: 5000,
            icon: '📦',
          });
        } else if (notification.type === 'status_update') {
          toast.success(notification.message, {
            duration: 4000,
            icon: '🔄',
          });
        } else if (notification.type === 'assignment') {
          toast.success(notification.message, {
            duration: 4000,
            icon: '👤',
          });
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          // Reinitialize connection
          const newEventSource = new EventSource('/api/notifications/stream');
          eventSourceRef.current = newEventSource;
        }
      }, 5000);
    };

    return () => {
      eventSource.close();
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  return {
    playNotificationSound,
  };
};