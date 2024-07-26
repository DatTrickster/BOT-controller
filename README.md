### React Native Robot Controller
This React Native application allows users to control a robot using either joystick or directional button controls. The app communicates with an ESP8266 microcontroller to send movement commands.

### Features
Switch between joystick and directional button control modes
Send movement commands to the robot (forward, backward, left, right, stop)
Display connection status and connection speed to the ESP8266
Debug panel showing the current direction command
Installation
Prerequisites
Node.js and npm: Make sure you have Node.js and npm installed. You can download them from nodejs.org.
React Native CLI: Install the React Native CLI by running npm install -g react-native-cli.
### Clone the Repository
- Clone this repository to your local machine:



- git clone https://github.com/DatTrickster/BOT-controller.git
- cd react-native-robot-controller
- Install Dependencies
### Install the necessary npm packages:

- npm install
- Running the App
- Connect your Android/iOS device or start an emulator, then run:

- npx react-native run-android   # for Android
- npx react-native run-ios       # for iOS
### Usage
- Connection Status: The app will attempt to connect to the ESP8266 at the specified IP address (http://192.168.4.1 by default). The - connection status and speed will be displayed at the top.
- Switch Control Modes: Use the toggle switch to switch between joystick and directional button controls.
- Joystick Control: When in joystick mode, use the joystick to control the robot's direction. The joystick can control the robot to move forward, backward, left, right, or stop.
- Directional Button Control: When in directional button mode, use the buttons to control the robot's direction.
- Debug Panel: The debug panel at the bottom of the screen displays the current direction command being sent to the robot.
### Code Overview
Control Modes
The app provides two modes of controlling the robot:

## Joystick Control Mode:
Users can use an on-screen joystick to control the robot's direction.
The joystick supports four main directions: forward, backward, left, and right.
When the joystick is released, a stop command is sent to the robot.
- Directional Button Control Mode:
Users can press on-screen buttons to control the robot's movement.
- The available buttons are: forward, backward, left, right, and stop.
Each button press sends the corresponding command to the robot.
Connection Management
- Connection Status: The app continuously checks the connection status to the ESP8266 and displays it. It also shows the connection speed in milliseconds.
- Reconnection Attempts: If the connection fails, the app attempts to reconnect every 5 seconds.
Sending Commands
- Command Sending: The app sends movement commands to the ESP8266 based on user input (either from the joystick or buttons).
Error Handling: If there is an error in sending commands, the app displays an alert to inform the user of a network error.
Components
- Joystick: A custom joystick component for controlling the robot's movement.
App: The main app component managing the connection status, control modes, and sending commands to the ESP8266.
Styles
The app uses StyleSheet to style various components, such as the joystick container, buttons, and status panel.

### Troubleshooting
- Connection Issues: If the app is unable to connect to the ESP8266, ensure the IP address is correct and the device is within range.
- Debugging: Use the debug panel to see the current direction command being sent.
