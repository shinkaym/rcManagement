import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AppTabBar } from '../components/app-tab-bar';
import type { MainTabParamList } from '../navigation-types';
import { TAB_ROUTES } from '../route-names';
import { EmployeeStackNavigator } from './employee-stack';
import { HomeStackNavigator } from './home-stack';
import { ReportStackNavigator } from './report-stack';
import { SettingStackNavigator } from './setting-stack';

const Tab = createBottomTabNavigator<MainTabParamList>();

function renderTabBar(props: Parameters<typeof AppTabBar>[0]) {
  return <AppTabBar {...props} />;
}

export function MainTabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName={TAB_ROUTES.HOME_STACK}
      screenOptions={{ headerShown: false }}
      tabBar={renderTabBar}
    >
      <Tab.Screen name={TAB_ROUTES.HOME_STACK} component={HomeStackNavigator} />
      <Tab.Screen name={TAB_ROUTES.REPORT_STACK} component={ReportStackNavigator} />
      <Tab.Screen name={TAB_ROUTES.EMPLOYEE_STACK} component={EmployeeStackNavigator} />
      <Tab.Screen name={TAB_ROUTES.SETTING_STACK} component={SettingStackNavigator} />
    </Tab.Navigator>
  );
}
