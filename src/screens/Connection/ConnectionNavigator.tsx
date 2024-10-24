
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WifiConnectionPage from './WifiConnectionPage';
import HostConnectionPage from './HostConnectionPage';
import CredentialConnectionPage from './CredentialConnectionPage';
const ConnectionTab = createBottomTabNavigator();
const ConnectionNavigator = () => {
    return (
      <ConnectionTab.Navigator>
        <ConnectionTab.Screen 
          name="Wifi" 
          component={WifiConnectionPage}
          options={{
            tabBarLabel: 'Wifi',
            headerShown: false,
          }}
        />
        <ConnectionTab.Screen 
          name="Host" 
          component={HostConnectionPage}
          options={{
            tabBarLabel: 'Host',
            headerShown: false,
          }}
        />
      </ConnectionTab.Navigator>
    );
};
export default ConnectionNavigator;