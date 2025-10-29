import io, { Socket } from 'socket.io-client';
import { Config } from '@/config/environment';
import { useAuthStore } from '../store/authStore';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(): void {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      console.warn('No authentication token available for socket connection');
      return;
    }

    try {
      this.socket = io(Config.API_BASE_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Storing the socket globally for easy access
      (global as any).socket = this.socket;
    } catch (error) {
      console.error('Failed to connect socket:', error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      (global as any).socket = null;
    }
  }

  emit(event: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();