import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PlayerStatPage from './PlayerStatPage';
import PlayerAttributePage from './PlayerAttributePage';
import UpgradesPage from './UpgradesPage';
const GamePlayTab = createBottomTabNavigator();
const GamePlayNavigator = () => {
    return (
      <GamePlayTab.Navigator>
        <GamePlayTab.Screen 
          name="PlayerStat" 
          component={PlayerStatPage}
          options={{
            tabBarLabel: 'Player Stat',
            headerShown: false,
          }}
        />
        <GamePlayTab.Screen 
          name="PlayerAttribute" 
          component={PlayerAttributePage}
          options={{
            tabBarLabel: 'Player Attribute',
            headerShown: false,
          }}
        />
        <GamePlayTab.Screen 
          name="Upgrades" 
          component={UpgradesPage}
          options={{
            tabBarLabel: 'Upgrades',
            headerShown: false,
          }}
        />
      </GamePlayTab.Navigator>
    );
};
export default GamePlayNavigator;