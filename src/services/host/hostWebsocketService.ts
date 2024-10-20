// websocketService.ts
import { BaseMessage, MessageListener, HostWebSocketServiceInterface } from './hostTypes';

class HostWebSocketService implements HostWebSocketServiceInterface {
  private url: string;
  private ws: WebSocket | null;
  private isConnected: boolean;
  private reconnectAttempts: number;
  private readonly maxReconnectAttempts: number;
  private readonly listeners: Map<string, Set<MessageListener>>;

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
          console.log('WebSocket Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event: WebSocketMessageEvent) => {
          try {
            const data: BaseMessage = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        this.ws.onerror = (event: Event) => {
          const error = event as WebSocketErrorEvent;
          console.error('WebSocket Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket Disconnected');
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

  private handleMessage(data: BaseMessage): void {
    const key = `${data.ActionCode}`;
    
    if (this.listeners.has(key)) {
      const callbacks = this.listeners.get(key);
      callbacks?.forEach(callback => callback(data));
    }
  }

  public addMessageListener(
    actionCode: number,
    callback: MessageListener
    ): void {
        const key = `${actionCode}`;
        if (!this.listeners.has(key)) {
        this.listeners.set(key, new Set());
        }
        this.listeners.get(key)?.add(callback);
    }

  public removeMessageListener(
    actionCode: number,
    callback: MessageListener
    ): void {
        const key = `${actionCode}`;
        this.listeners.get(key)?.delete(callback);
    }

  public sendMessage<T>(
    actionCode: number,
    messageType: number,
    message: string = "",
    data: T | null = null
    ): void {
        if (!this.isConnected || !this.ws) {
        throw new Error('WebSocket is not connected');
        }

    const payload: BaseMessage<T> = {
      ActionCode: actionCode,
      MessageType: messageType,
      Message: message,
      Data: data as T
    };

    this.ws.send(JSON.stringify(payload));
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

export default HostWebSocketService;