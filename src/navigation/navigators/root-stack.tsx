import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation-types';
import { ROOT_ROUTES } from '../route-names';
import { AppDrawerNavigator } from './app-drawer';
import { ScanStackNavigator } from './scan-stack';
import { LoginRouteScreen } from './screens/login-route-screen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStackNavigator() {
  return (
    <Stack.Navigator initialRouteName={ROOT_ROUTES.LOGIN} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROOT_ROUTES.LOGIN} component={LoginRouteScreen} />
      <Stack.Screen name={ROOT_ROUTES.APP_DRAWER} component={AppDrawerNavigator} />
      <Stack.Screen name={ROOT_ROUTES.SCAN_STACK} component={ScanStackNavigator} />
    </Stack.Navigator>
  );
}
