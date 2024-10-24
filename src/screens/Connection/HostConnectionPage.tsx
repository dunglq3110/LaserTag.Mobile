import React, { useState, useEffect  } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { useSelector } from 'react-redux';
import { getHostWebSocket } from '../../services/host/hostGlobalWebSocket';
import { RootState } from '../../store/store';


const HostConnectionPage: React.FC = () => {
  const playerInfo = useSelector((state: RootState) => state.player);
  const [hostIP, setHostIP] = useState('');
  const [playerName, setPlayerName] = useState(playerInfo.Name || '');
  const [gunMac, setGunMac] = useState(playerInfo.MacGun || '');
  const [vestMac, setVestMac] = useState(playerInfo.MacVest || '');

  const handleJoinGame = async () => {
    if (!hostIP.trim()) {
      Alert.alert('Error', 'Please enter a host IP address');
      return;
    }
    
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }

    if (!gunMac.trim() || !vestMac.trim()) {
      Alert.alert('Error', 'Please enter both Gun and Vest MAC addresses');
      return;
    }

    // Send update message
    await getHostWebSocket().connect('ws://' + hostIP + ':8080/LaserTag');
    await getHostWebSocket().sendMessage(0, 0, "", {
      Name: playerName,
      MacGun: gunMac,
      MacVest: vestMac
    });
  };
  const handleConnect = () => {
    
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Host IP Address Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Host IP Address</Text>
          <TextInput
            style={styles.input}
            value={hostIP}
            onChangeText={setHostIP}
            placeholder="Enter Host IP Address"
            placeholderTextColor="#999"
            keyboardType="numeric"
            autoCapitalize="none"
          />
        </View>
  
        {/* Player Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Player Name</Text>
          <TextInput
            style={styles.input}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Enter Player Name"
            placeholderTextColor="#999"
          />
        </View>
  
        {/* Gun MAC Address Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gun's MAC Address</Text>
          <TextInput
            style={styles.input}
            value={gunMac}
            onChangeText={setGunMac}
            placeholder="Enter Gun's MAC Address"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
        </View>
  
        {/* Vest MAC Address Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vest's MAC Address</Text>
          <TextInput
            style={styles.input}
            value={vestMac}
            onChangeText={setVestMac}
            placeholder="Enter Vest's MAC Address"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
        </View>
  
        {/* Buttons: Image Button and Join Game Button */}
        <View style={styles.buttonRow}>
          {/* Join Game Button */}
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={handleJoinGame}
          >
            <Text style={styles.connectButtonText}>Join Game!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  iconButton: {
    height: 50,
    width: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconImage: {
    height: 40,  
    width: 40,   
    resizeMode: 'contain',
  },
  connectButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HostConnectionPage;