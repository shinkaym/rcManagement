import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { HomeScreen } from '@/screens/home/home-screen';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { MainHeader, MainHeaderCenterChip } from '../components/main-header';
import { useShellDrawer } from '../components/shell-drawer-context';
import type { HomeStackParamList } from '../navigation-types';
import { HOME_ROUTES } from '../route-names';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={HOME_ROUTES.HOME} component={HomeRouteScreen} />
    </Stack.Navigator>
  );
}

function HomeRouteScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { toggleDrawer } = useShellDrawer();
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <View style={styles.screen}>
      <MainHeader centerChild={<MainHeaderCenterChip label={monthLabel} />} onMenuPress={toggleDrawer} />
      <View style={styles.content}>
        <HomeScreen />
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
  });
}
