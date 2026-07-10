import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { EmployeeFormScreen } from '@/screens/employee/employee-form-screen';
import { EmployeeScreen } from '@/screens/employee/employee-screen';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { MainHeader } from '../components/main-header';
import { useShellDrawer } from '../components/shell-drawer-context';
import { SubHeader } from '../components/sub-header';
import type { EmployeeStackParamList } from '../navigation-types';
import { EMPLOYEE_ROUTES } from '../route-names';

const Stack = createNativeStackNavigator<EmployeeStackParamList>();

export function EmployeeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={EMPLOYEE_ROUTES.EMPLOYEE} component={EmployeeRouteScreen} />
      <Stack.Screen name={EMPLOYEE_ROUTES.EMPLOYEE_DETAIL} component={EmployeeDetailRouteScreen} />
    </Stack.Navigator>
  );
}

function EmployeeRouteScreen({
  navigation,
}: NativeStackScreenProps<EmployeeStackParamList, typeof EMPLOYEE_ROUTES.EMPLOYEE>) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { toggleDrawer } = useShellDrawer();

  return (
    <View style={styles.screen}>
      <MainHeader title='Employee' onMenuPress={toggleDrawer} />
      <View style={styles.content}>
        <EmployeeScreen
          onCreateEmployee={() => navigation.navigate(EMPLOYEE_ROUTES.EMPLOYEE_DETAIL, { mode: 'create' })}
          onEditEmployee={(employeeId) =>
            navigation.navigate(EMPLOYEE_ROUTES.EMPLOYEE_DETAIL, { mode: 'edit', employeeId })
          }
        />
      </View>
    </View>
  );
}

function EmployeeDetailRouteScreen({
  navigation,
  route,
}: NativeStackScreenProps<EmployeeStackParamList, typeof EMPLOYEE_ROUTES.EMPLOYEE_DETAIL>) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const title = route.params.mode === 'create' ? 'Create Employee' : 'Employee Detail';

  return (
    <View style={styles.screen}>
      <SubHeader onBackPress={() => navigation.goBack()} title={title} />
      <View style={styles.content}>
        <EmployeeFormScreen
          employeeId={route.params.employeeId}
          mode={route.params.mode}
          onClose={() => navigation.goBack()}
        />
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
