// src/services/globalWebSocket.ts
import WebSocketService from './hostWebsocketService';
import { store } from '../../store/store';
import { updatePlayerInfo, setConnectionStatus } from '../../store/slices/playerSlice';
import { setCredit, setUpgrades } from '../../store/slices/upgradesSlice';
import { BaseMessage, PlayerData } from './hostTypes';
import Toast from 'react-native-toast-message';
import { getGunWebSocket } from '../gun/gunGlobalWebSocket';
import {parseStartBattleMessage} from '../gun/gunTypes';

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

    this.wsService.addMessageListener(21, (frame: BaseMessage) => {
      console.log('frame data 21:', frame);
      if (frame?.Data) {
        // Update the Redux store with the new data
        store.dispatch(setCredit(frame.Data.Credit));
        store.dispatch(setUpgrades(frame.Data.Upgrades));
        
        Toast.show({
          type: 'info',  
          text1: 'Upgrades list!',
          text2: frame.Message,  
          position: 'top',  
          visibilityTime: 4000,
        });
      }     
    });

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

    this.wsService.addMessageListener(23, (frame: BaseMessage) => {
      console.log('frame data 23:', frame);
      if (frame?.Data) {
        try {
          // Parse the message directly from frame.Data
          const battleMessage = parseStartBattleMessage(frame.Data);
          getGunWebSocket().sendMessage(battleMessage);
        } catch (error) {
          console.error('Failed to parse start battle message:', error);
        }
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