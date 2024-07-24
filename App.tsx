import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Animated, PanResponder, GestureResponderEvent, PanResponderGestureState, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Joystick component that handles the position and movement of the joystick
const Joystick: React.FC<{ size: number; onMove: (position: { x: number; y: number }) => void }> = ({ size, onMove }) => {
  // Animated value to manage the joystick's position
  const [position] = useState(new Animated.ValueXY({ x: 0, y: 0 }));

  // PanResponder to handle touch gestures for joystick movement
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const { dx, dy } = gestureState;
      position.setValue({ x: dx, y: dy });
      onMove({ x: dx, y: dy });
    },
    onPanResponderRelease: () => {
      // Reset joystick position on release
      position.setValue({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
    },
  });

  return (
    <View style={[styles.joystickContainer, { width: size, height: size }]}>
      <Animated.View
        style={[styles.joystick, {
          width: size / 3,
          height: size / 3,
          transform: position.getTranslateTransform(),
        }]}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

// Direction controls component for simpler directional input
const DirectionControls: React.FC<{ onDirectionChange: (direction: string) => void }> = ({ onDirectionChange }) => {
  return (
    <View style={styles.directionControls}>
      <TouchableOpacity style={styles.directionButton} onPress={() => onDirectionChange('Back')}>
        <Text style={styles.directionText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.directionButton} onPress={() => onDirectionChange('Front')}>
        <Text style={styles.directionText}>Front</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.directionButton} onPress={() => onDirectionChange('Left')}>
        <Text style={styles.directionText}>Left</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.directionButton} onPress={() => onDirectionChange('Right')}>
        <Text style={styles.directionText}>Right</Text>
      </TouchableOpacity>
    </View>
  );
};

const App: React.FC = () => {
  // State variables
  const [direction, setDirection] = useState<string>(''); // Current direction for direction controls
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // Joystick position
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...'); // Connection status message
  const [connectionSpeed, setConnectionSpeed] = useState<number>(0); // Connection speed in milliseconds
  const [espIP, setEspIP] = useState<string>('http://192.168.4.1'); // Default IP address for ESP8266
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false); // State for sidebar visibility
  const [networks, setNetworks] = useState<string[]>([]); // List of available Wi-Fi networks
  const [controlMode, setControlMode] = useState<'joystick' | 'direction'>('joystick'); // Current control mode

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Request location permission for scanning Wi-Fi networks
  const requestLocationPermission = async () => {
    try {
      const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (result === RESULTS.DENIED) {
        const requestResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (requestResult === RESULTS.GRANTED) {
          fetchAvailableNetworks();
        } else {
          Alert.alert('Permission Denied', 'Location permission is required to scan Wi-Fi networks.');
        }
      } else if (result === RESULTS.GRANTED) {
        fetchAvailableNetworks();
      } else {
        Alert.alert('Permission Status', 'Location permission status is unknown.');
      }
    } catch (error) {
      console.error('Failed to request location permission:', error);
      Alert.alert('Error', 'Failed to request location permission.');
    }
  };

  // Fetch available Wi-Fi networks and remove duplicates
  const fetchAvailableNetworks = async () => {
    try {
      const wifiList = await WifiManager.loadWifiList();
      const uniqueNetworks = Array.from(new Set(wifiList.map((wifi: any) => wifi.SSID)));
      setNetworks(uniqueNetworks);
    } catch (error) {
      console.error('Failed to load Wi-Fi networks:', error);
      Alert.alert('Error', 'Failed to load Wi-Fi networks');
    }
  };

  // Handle joystick movement and send position to ESP8266
  const handleMove = (newPosition: { x: number; y: number }) => {
    if (newPosition.x > 50) setDirection('Right');
    else if (newPosition.x < -50) setDirection('Left');
    else if (newPosition.y > 50) setDirection('Down');
    else if (newPosition.y < -50) setDirection('Up');
    else setDirection('');

    setPosition(newPosition);
    sendPositionToESP(newPosition);
  };

  // Handle direction control button presses
  const handleDirectionChange = (newDirection: string) => {
    setDirection(newDirection);
    sendPositionToESP({ x: 0, y: 0 }); // Adjust position as needed
  };

  // Send position to ESP8266 server
  const sendPositionToESP = (position: { x: number; y: number }) => {
    fetch(`${espIP}/?x=${position.x.toFixed(2)}&y=${position.y.toFixed(2)}`)
      .then(response => response.text())
      .then(data => console.log('Position response:', data))
      .catch(error => {
        console.error('Error sending position:', error);
        Alert.alert('Network Error', 'Unable to connect to ESP8266. Please check your connection.');
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusPanel}>
        <Text style={styles.statusText}>Connection Status: {connectionStatus}</Text>
        <Text style={styles.statusText}>Connection Speed: {connectionSpeed} ms</Text>
        <TouchableOpacity onPress={() => setIsSidebarVisible(true)}>
          <Text style={styles.statusText}>Show Networks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleSwitch}
          onPress={() => setControlMode(controlMode === 'joystick' ? 'direction' : 'joystick')}
        >
          <Text style={styles.toggleSwitchText}>{controlMode === 'joystick' ? 'Switch to Direction Controls' : 'Switch to Joystick Controls'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Control</Text>
      {controlMode === 'joystick' ? (
        <Joystick size={200} onMove={handleMove} />
      ) : (
        <DirectionControls onDirectionChange={handleDirectionChange} />
      )}
      <View style={styles.debugPanel}>
        <Text style={styles.debugText}>Direction: {direction}</Text>
        <Text style={styles.debugText}>X Position: {position.x.toFixed(2)}</Text>
        <Text style={styles.debugText}>Y Position: {position.y.toFixed(2)}</Text>
      </View>
      <Modal
        visible={isSidebarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSidebarVisible(false)}
      >
        <View style={styles.sidebar}>
          <FlatList
            data={networks}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.networkItem}>
                <Text style={styles.networkText}>{item}</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

// Styles for various components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  joystickContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: '#ddd',
    marginBottom: 20,
  },
  joystick: {
    borderRadius: 40,
    backgroundColor: '#666',
  },
  statusPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#eee',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  toggleSwitch: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  toggleSwitchText: {
    color: '#fff',
    fontSize: 16,
  },
  debugPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#eee',
    padding: 10,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  sidebar: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  networkItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  networkText: {
    fontSize: 18,
    color: 'black',
  },
  directionControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
  },
  directionButton: {
    backgroundColor: '#007bff',
    padding: 15,
    margin: 5,
    borderRadius: 5,
  },
  directionText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default App;
