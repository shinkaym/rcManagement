import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { ReportScreen } from '@/screens/report/report-screen';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { MainHeader, MainHeaderCenterChip } from '../components/main-header';
import { useShellDrawer } from '../components/shell-drawer-context';
import type { ReportStackParamList } from '../navigation-types';
import { REPORT_ROUTES } from '../route-names';
import { AppTheme } from '@/shared/theme';

const Stack = createNativeStackNavigator<ReportStackParamList>();

export function ReportStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={REPORT_ROUTES.REPORT} component={ReportRouteScreen} />
    </Stack.Navigator>
  );
}

function ReportRouteScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { toggleDrawer } = useShellDrawer();
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <View style={styles.screen}>
      <MainHeader centerChild={<MainHeaderCenterChip label={monthLabel} />} onMenuPress={toggleDrawer} />
      <View style={styles.content}>
        <ReportScreen />
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
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
