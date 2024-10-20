export interface BaseMessage<T = any> {
    ActionCode: number;
    MessageType: number;
    Message: string;
    Data: T;
}
  
export interface PlayerData {
    Name: string;
    MacGun: string;
    MacVest: string;
}
  
export type MessageListener = (data: BaseMessage) => void;
  
export interface HostWebSocketServiceInterface {
    connect(): Promise<void>;
    disconnect(): void;
    sendMessage<T>(actionCode: number, messageType: number, message?: string, data?: T): void;
    addMessageListener(actionCode: number, callback: MessageListener): void;
    removeMessageListener(actionCode: number, callback: MessageListener): void;
}