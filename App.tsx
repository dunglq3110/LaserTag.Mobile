import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

import { createDrawerNavigator } from '@react-navigation/drawer';
import ConnectionNavigator from './src/screens/Connection/ConnectionNavigator';
import GamePlayNavigator from './src/screens/GamePlay/GamePlayNavigator'; 
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

const Drawer = createDrawerNavigator();
export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Drawer.Screen 
            name="Connection" 
            component={ConnectionNavigator}
            options={{
              title: 'Connection',
            }}
          />
          <Drawer.Screen 
            name="GamePlay" 
            component={GamePlayNavigator}
            options={{
              title: 'Game Play',
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
      <Toast />
    </Provider>
    
  );
}