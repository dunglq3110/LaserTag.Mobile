// src/services/globalWebSocket.ts
import WebSocketService from './hostWebsocketService';
import { store } from '../../store/store';
import { updatePlayerInfo, setConnectionStatus } from '../../store/slices/playerSlice';
import { BaseMessage, PlayerData } from './hostTypes';
import Toast from 'react-native-toast-message';
import { getGunWebSocket } from '../gun/gunGlobalWebSocket';

class HostGlobalWebSocketService {
  private static instance: HostGlobalWebSocketService;
  private wsService: WebSocketService | null = null;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): HostGlobalWebSocketService {
    if (!HostGlobalWebSocketService.instance) {
      HostGlobalWebSocketService.instance = new HostGlobalWebSocketService();
    }
    return HostGlobalWebSocketService.instance;
  }

  public async connect(url: string): Promise<void> {
    if (!this.wsService) {
      this.wsService = new WebSocketService(url);
      
      // Set up global message handlers
      this.setupMessageHandlers();
      
      try {
        await this.wsService.connect();
        store.dispatch(setConnectionStatus(true));
      } catch (error) {
        console.error('Failed to connect:', error);
        store.dispatch(setConnectionStatus(false));
        throw error;
      }
    }
  }

  private setupMessageHandlers(): void {
    if (!this.wsService) return;

    // Handle player info updates (ActionCode 0)
    this.wsService.addMessageListener(22,(frame: BaseMessage) => {
      console.log('frame data 22:', frame);
      if (frame?.Data) {
        getGunWebSocket().sendMessage({
          key: 'players_registering',
          data: frame.Data
        });
      }
    });

    this.wsService.addMessageListener(200,(frame: BaseMessage) => {
      console.log('frame data 200:', frame);
      if (frame?.Message) {
        //set toast type based on message type
        var messageType = 'info';
        if (frame.MessageType === 1) {
          messageType = 'success';
        }
        else if (frame.MessageType === 2) {
          messageType = 'error';
        }
        Toast.show({
          type: messageType,  
          text1: 'Game Notification!',
          text2: frame.Message,  
          position: 'top',  
          visibilityTime: 4000,
        });
      }     
    });

   

    // Add more global message handlers here
  }

  public sendMessage<T>(actionCode: number, messageType: number, message: string = "", data: T | null = null): void {
    if (!this.wsService) {
      throw new Error('WebSocket not initialized. Call connect() first.');
    }
    this.wsService.sendMessage(actionCode, messageType, message, data);
  }

  public disconnect(): void {
    if (this.wsService) {
      this.wsService.disconnect();
      store.dispatch(setConnectionStatus(false));
    }
  }

  public isConnected(): boolean {
    return this.wsService?.getConnectionStatus() ?? false;
  }
}

export default HostGlobalWebSocketService;

// Export a convenience function to get the instance
export const getHostWebSocket = () => HostGlobalWebSocketService.getInstance();