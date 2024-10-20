import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from   '../../store/store';
import { getHostWebSocket } from '../../services/host/hostGlobalWebSocket';
import { PlayerData } from '../../services/host/hostTypes';
const CredentialConnectionPage : React.FC = () => {

    const playerInfo = useSelector((state: RootState) => state.player);
    const isConnected = useSelector((state: RootState) => state.player.isConnected);
  
    const sendGameAction = () => {
      const playerData: PlayerData = {
        Name: "PlayerOne",
        MacGun: "AA:BB:CC:DD:EE:AA",
        MacVest: "77:88:99:00:11:45"
      };
  
      try {
        getHostWebSocket().sendMessage(0, 0, "", playerData);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    };
    return (
        <View style={{ flex: 1, padding: 20 }}>
          <Text>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
          <Text>Player Name: {playerInfo.Name}</Text>
          <Text>Gun MAC: {playerInfo.MacGun}</Text>
          <Text>Vest MAC: {playerInfo.MacVest}</Text>
          
          <Button title="Send Game Action" onPress={sendGameAction} />
        </View>
      );
}

export default CredentialConnectionPage;