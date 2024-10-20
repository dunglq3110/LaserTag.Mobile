// src/services/gunWebsocketService.ts
import { GunBaseMessage, GunMessageHandler, GunWebSocketServiceInterface, isGunBaseMessage } from './gunTypes';

class GunWebSocketService implements GunWebSocketServiceInterface {
  private url: string;
  private ws: WebSocket | null;
  private isConnected: boolean;
  private reconnectAttempts: number;
  private readonly maxReconnectAttempts: number;
  private readonly listeners: Map<string, Set<GunMessageHandler>>;

  constructor(url: string) {
    this.url = url;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('Gun WebSocket Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event: WebSocketMessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (isGunBaseMessage(data)) {
              console.log('Received accepted message:', data);
              this.handleMessage(data);
            } else {
              console.warn('Received message does not match expected format:', data);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        this.ws.onerror = (event: Event) => {
          const error = event as WebSocketErrorEvent;
          console.error('Gun WebSocket Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Gun WebSocket Disconnected');
          this.isConnected = false;
          this.handleReconnect();
        };

      } catch (error) {
        console.error('Connection Error:', error);
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        this.connect();
      }, 3000);
    }
  }

  private handleMessage(message: GunBaseMessage): void {
    if (this.listeners.has(message.key)) {
      const callbacks = this.listeners.get(message.key);
      callbacks?.forEach(callback => callback(message));
    }
  }

  public addMessageListener(key: string, callback: GunMessageHandler): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)?.add(callback);
  }

  public removeMessageListener(key: string, callback: GunMessageHandler): void {
    this.listeners.get(key)?.delete(callback);
  }

  public sendMessage(message: GunBaseMessage): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('WebSocket is not connected');
    }

    this.ws.send(JSON.stringify(message));
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default GunWebSocketService;