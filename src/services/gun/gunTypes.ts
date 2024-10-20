// src/services/gunWebsocketTypes.ts

// Base interface for all gun-related websocket messages

export interface GunBaseMessage {
    key: string;
    [key: string]: any;  // Allow for dynamic additional properties
  }
  
  // Type guard to check if a message matches GunBaseMessage structure
  export function isGunBaseMessage(message: any): message is GunBaseMessage {
    return message && typeof message === 'object' && typeof message.key === 'string';
  }
  
  // Specific message types
  export interface PlayersRegisteringMessage extends GunBaseMessage {
    key: 'players_registering';
    data: {
      player_id: string;
      gun_mac_address: string;
      vest_mac_address: string;
      team_id: string;
    }[];
  }
  
  export interface StartBattleMessage extends GunBaseMessage {
    key: 'start_battle';
    for_gun: {
      damage: number;
      heal: number;
      health: number;
    };
  }
  export interface SubmitMacMessage extends GunBaseMessage {
    key: 'submit_mac';
    gun_mac: string;
    vest_mac: string;
    is_vest_conected: boolean;
  }
  // Type for message handlers
  export type GunMessageHandler = (message: GunBaseMessage) => void;
  
  // Interface for the websocket service
  export interface GunWebSocketServiceInterface {
    connect(): Promise<void>;
    disconnect(): void;
    sendMessage(message: GunBaseMessage): void;
    addMessageListener(key: string, callback: GunMessageHandler): void;
    removeMessageListener(key: string, callback: GunMessageHandler): void;
  }