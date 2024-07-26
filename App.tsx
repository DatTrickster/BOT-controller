import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity, Animated, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import axios from 'axios';

// Joystick component for controlling the robot
const Joystick: React.FC<{ size: number; onMove: (direction: string) => void }> = ({ size, onMove }) => {
  const [position] = useState(new Animated.ValueXY({ x: 0, y: 0 }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const { dx, dy } = gestureState;
      const direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'backwards' : 'forwards');
      position.setValue({ x: dx, y: dy });
      onMove(direction);
    },
    onPanResponderRelease: () => {
      position.setValue({ x: 0, y: 0 });
      onMove('stop');
    },
  });

  return (
    <View style={[styles.joystickContainer, { width: size, height: size }]}>
      <Animated.View
        style={[styles.joystick, {
          width: size / 2.5,
          height: size / 2.5,
          transform: position.getTranslateTransform(),
        }]}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

// Main app component
const App: React.FC = () => {
  const [direction, setDirection] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');
  const [connectionSpeed, setConnectionSpeed] = useState<number>(0); // in milliseconds
  const [espIP, setEspIP] = useState<string>('http://192.168.4.1'); // Default IP for AP mode
  const [controlMode, setControlMode] = useState<'joystick' | 'direction'>('direction');

  useEffect(() => {
    const checkConnection = () => {
      const startConnectionTimer = Date.now();
      axios.get(espIP)
        .then(response => {
          setConnectionStatus('Connected');
          setConnectionSpeed(Date.now() - startConnectionTimer); // Calculate connection speed
        })
        .catch(error => {
          setConnectionStatus('Failed to Connect');
          console.error('Connection Error:', error);
        });
    };

    checkConnection();
    const interval = setInterval(() => {
      if (connectionStatus === 'Connected') {
        checkConnection();
      }
    }, 5000); // Check connection every 5 seconds

    return () => clearInterval(interval);
  }, [espIP, connectionStatus]);

  const handleDirectionChange = (newDirection: string) => {
    setDirection(newDirection);
    sendCommandToESP(newDirection); // Send command based on button press
  };

  const handleJoystickMove = (newDirection: string) => {
    setDirection(newDirection);
    sendCommandToESP(newDirection); // Send command based on joystick movement
  };

  const sendCommandToESP = async (command: string) => {
    try {
      const response = await axios.get(`${espIP}/${command}`);
      console.log('Command response:', response.data);
    } catch (error) {
      console.error('Error sending command:', error);
      Alert.alert('Network Error', 'Unable to connect to ESP8266. Please check your connection.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusPanel}>
        <Text style={[styles.statusText, connectionStatus === 'Connected' && styles.connectedStatusText]}>
          Connection Status: {connectionStatus}
        </Text>
        <Text style={styles.statusText}>Connection Speed: {connectionSpeed} ms</Text>
        <TouchableOpacity
          style={styles.toggleSwitch}
          onPress={() => setControlMode(controlMode === 'joystick' ? 'direction' : 'joystick')}
        >
          <Text style={styles.toggleSwitchText}>{controlMode === 'joystick' ? 'Switch to Direction Controls' : 'Switch to Joystick Controls'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{controlMode === 'joystick' ? 'Joystick Control' : 'Direction Control'}</Text>
      {controlMode === 'direction' ? (
        <View style={styles.directionControls}>
          <TouchableOpacity style={styles.directionButton} onPress={() => handleDirectionChange('backward')}>
            <Text style={styles.directionText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.directionButton} onPress={() => handleDirectionChange('forward')}>
            <Text style={styles.directionText}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.directionButton} onPress={() => handleDirectionChange('left')}>
            <Text style={styles.directionText}>Left</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.directionButton} onPress={() => handleDirectionChange('right')}>
            <Text style={styles.directionText}>Right</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.directionButton} onPress={() => handleDirectionChange('stop')}>
            <Text style={styles.directionText}>Stop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Joystick size={200} onMove={handleJoystickMove} />
      )}
      <View style={styles.debugPanel}>
        <Text style={styles.debugText}>Direction: {direction}</Text>
      </View>
    </View>
  );
};

// Styles for the app components
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
  connectedStatusText: {
    color: 'green',
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
  directionControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
  directionButton: {
    backgroundColor: '#007bff',
    padding: 15,
    margin: 5,
    borderRadius: 5,
    width: 100,
    alignItems: 'center',
  },
  directionText: {
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
    color: 'black',
    marginBottom: 5,
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
});

export default App;
