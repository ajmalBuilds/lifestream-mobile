import io, { Socket } from 'socket.io-client';
import { Config } from '@/config/environment';
import { useAuthStore } from '@/store/authStore';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private connectionPromise: Promise<boolean> | null = null;

  async connect(): Promise<boolean> {
    if (this.isConnected && this.socket) {
      return true;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve) => {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        console.warn('No authentication token available for socket connection');
        resolve(false);
        return;
      }

      try {
        this.socket = io(Config.API_BASE_URL.replace('/api', ''), {
          auth: {
            token: token,
          },
          transports: ['websocket', 'polling'], // Add polling as fallback
        });

        const connectionTimeout = setTimeout(() => {
          console.warn('Socket connection timeout');
          this.connectionPromise = null;
          resolve(false);
        }, 10000);

        this.socket.on('connect', () => {
          console.log('✅ Socket connected');
          this.isConnected = true;
          clearTimeout(connectionTimeout);
          this.connectionPromise = null;
          resolve(true);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Socket disconnected:', reason);
          this.isConnected = false;
          this.connectionPromise = null;
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          clearTimeout(connectionTimeout);
          this.connectionPromise = null;
          resolve(false);
        });

        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
        });

        // Add chat-specific events
        this.socket.on('welcome', (data) => {
          console.log('👋 Socket welcome:', data);
        });

        this.socket.on('joined-room', (data) => {
          console.log('🚪 Joined room:', data);
        });

        (global as any).socket = this.socket;
      } catch (error) {
        console.error('Failed to connect socket:', error);
        this.connectionPromise = null;
        resolve(false);
      }
    });

    return this.connectionPromise;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionPromise = null;
      (global as any).socket = null;
    }
  }

  async emit(event: string, data: any): Promise<boolean> {
    if (!this.isConnected || !this.socket) {
      const connected = await this.connect();
      if (!connected) {
        console.warn('Socket not connected, cannot emit event:', event);
        return false;
      }
    }

    return new Promise((resolve) => {
      if (this.socket && this.isConnected) {
        this.socket.emit(event, data, (response: any) => {
          if (response && response.error) {
            console.error(`❌ Socket emit error for ${event}:`, response.error);
            resolve(false);
          } else {
            resolve(true);
          }
        });

        // Fallback if no callback is provided by server
        setTimeout(() => resolve(true), 100);
      } else {
        console.warn('Socket not connected, cannot emit event:', event);
        resolve(false);
      }
    });
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn('Socket not initialized, cannot listen to event:', event);
    }
  }

  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Typing indicators
  async startTyping(conversationId: string, userId: string): Promise<boolean> {
    return this.emit('typing-start', { conversationId, userId });
  }

  async stopTyping(conversationId: string, userId: string): Promise<boolean> {
    return this.emit('typing-stop', { conversationId, userId });
  }

  // Leave conversation
  async leaveConversation(conversationId: string, userId: string): Promise<boolean> {
    return this.emit('leave-conversation', { conversationId, userId });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();