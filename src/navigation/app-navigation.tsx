import { NavigationContainer } from '@react-navigation/native';

import { RootStackNavigator } from './navigators/root-stack';

export function AppNavigation() {
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
}
