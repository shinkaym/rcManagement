import { DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { ReportScreen } from '@/screens/report/report-screen';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { MainHeader, MainHeaderCenterChip } from '../components/main-header';
import type { ReportStackParamList } from '../navigation-types';
import { REPORT_ROUTES } from '../route-names';

const Stack = createNativeStackNavigator<ReportStackParamList>();

export function ReportStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={REPORT_ROUTES.REPORT} component={ReportRouteScreen} />
    </Stack.Navigator>
  );
}

function ReportRouteScreen({ navigation }: { navigation: any }) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <View style={styles.screen}>
      <MainHeader centerChild={<MainHeaderCenterChip label={monthLabel} />} onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />
      <View style={styles.content}>
        <ReportScreen />
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
