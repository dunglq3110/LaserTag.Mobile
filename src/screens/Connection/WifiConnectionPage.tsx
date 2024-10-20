import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
  PermissionsAndroid
} from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import { useSelector } from 'react-redux';
import { RootState } from   '../../store/store';
import Toast from 'react-native-toast-message';
import { getGunWebSocket } from '../../services/gun/gunGlobalWebSocket';

interface WifiNetwork {
  SSID: string;
  level: number;
  capabilities: string;
}

const WifiConnectionPage: React.FC = () => {
  const [wifiName, setWifiName] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [gunIpAddress, setGunIpAddress] = useState('');
  const { MacGun, MacVest } = useSelector((state: RootState) => state.player);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app needs access to location to scan WiFi networks',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const scanWifiNetworks = async () => {
    setIsScanning(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required to scan WiFi networks');
        setIsScanning(false);
        return;
      }

      const wifiList = await WifiManager.loadWifiList();
      // Remove duplicate networks and sort by signal strength
      const uniqueNetworks = Array.from(
        new Map(wifiList.map(item => [item.SSID, item])).values()
      ).sort((a, b) => b.level - a.level);
      
      setNetworks(uniqueNetworks);
    } catch (error) {
      console.error('Error scanning WiFi:', error);
      Alert.alert('Error', 'Failed to scan WiFi networks');
    } finally {
      setIsScanning(false);
    }
  };

  const handleWifiSelection = async (network: WifiNetwork) => {
    try {
      // Check if network requires password (WEP, WPA, WPA2, etc.)
      const requiresPassword = network.capabilities.includes('WPA') || 
                             network.capabilities.includes('WEP') ||
                             network.capabilities.includes('PSK');
  
      if (requiresPassword) {
        Alert.alert(
          'Password Required',
          `The network "${network.SSID}" requires a password to connect.`
        );
        return;
      }
  
      // Try to connect to open network
      try {
        await WifiManager.connectToProtectedSSID(
          network.SSID,    // SSID
          '',              // empty password for open networks
          false,           // isWEP
          false            // isHidden
        );
        Alert.alert('Success', `Connected to ${network.SSID}`);
        setIsModalVisible(false);
      } catch (connectionError) {
        // Handle the specific case where the connection failed
        console.error('Connection error:', connectionError);
        Alert.alert('Connection Failed', 'Could not connect to the selected network');
      }
    } catch (error) {
      console.error('Error in WiFi selection:', error);
      Alert.alert('Error', 'Unable to process the selected network');
    }
  };

  const getSignalStrengthIcon = (level: number) => {
    // Convert dBm to bars (approximate)
    if (level >= -50) return '●●●●'; // Excellent
    if (level >= -60) return '●●●○'; // Good
    if (level >= -70) return '●●○○'; // Fair
    return '●○○○'; // Poor
  };

  const openWifiModal = () => {
    setIsModalVisible(true);
    scanWifiNetworks();
  };

  const HandleConnectGunIP = () => {
    if (!gunIpAddress.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: `Please enter Gun's IP Address`,
        position: 'top',
        visibilityTime: 4000,
      });
      return;
    }  
    getGunWebSocket().connect('ws://' + gunIpAddress + ':8081/LaserTag');
  };
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Wi-Fi Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Wi-Fi Name"
          value={wifiName}
          onChangeText={setWifiName}
        />

        <Text style={styles.label}>Wi-Fi Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Wi-Fi Password"
          secureTextEntry
          value={wifiPassword}
          onChangeText={setWifiPassword}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gun's IP Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Gun's IP Address"
            value={gunIpAddress}
            onChangeText={setGunIpAddress}
          />
        </View>

        {/* Display MacGun and MacVest values */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mac Gun: {MacGun}</Text>
          <Text style={styles.label}>Mac Vest: {MacVest}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={openWifiModal}>
            <Image source={require('../../../assets/icon.png')} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.connectButton} onPress={HandleConnectGunIP}>
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </View>


      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Networks</Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={scanWifiNetworks}
                disabled={isScanning}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {isScanning ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Scanning for networks...</Text>
              </View>
            ) : (
              <FlatList
                data={networks}
                keyExtractor={(item, index) => `${item.SSID}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.networkItem}
                    onPress={() => handleWifiSelection(item)}
                  >
                    <View style={styles.networkItemContent}>
                      <Text style={styles.networkName}>{item.SSID}</Text>
                      <Text style={styles.signalStrength}>
                        {getSignalStrengthIcon(item.level)}
                      </Text>
                    </View>
                    <Text style={styles.securityType}>
                      {item.capabilities.includes('WPA') ? '🔒' : ''}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    width: 24,
    height: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    color: '#007AFF',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  networkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  networkItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 10,
  },
  networkName: {
    fontSize: 16,
  },
  signalStrength: {
    color: '#007AFF',
  },
  securityType: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default WifiConnectionPage;