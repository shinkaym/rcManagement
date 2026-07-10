import { createDrawerNavigator } from '@react-navigation/drawer';

import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { AppDrawerContent } from '../components/app-drawer-content';
import type { AppDrawerParamList } from '../navigation-types';
import { DRAWER_ROUTES } from '../route-names';
import { CategoryStackNavigator } from './category-stack';
import { MainTabsNavigator } from './main-tabs';

const Drawer = createDrawerNavigator<AppDrawerParamList>();

function renderDrawerContent(props: Parameters<typeof AppDrawerContent>[0]) {
  return <AppDrawerContent {...props} />;
}

export function AppDrawerNavigator() {
  const theme = useAppTheme();

  return (
    <Drawer.Navigator
      initialRouteName={DRAWER_ROUTES.MAIN_TABS}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(25, 28, 29, 0.18)',
        drawerStyle: {
          width: '78%',
          backgroundColor: theme.colors.secondary,
        },
        sceneStyle: {
          backgroundColor: theme.colors.surface,
        },
      }}
      drawerContent={renderDrawerContent}
    >
      <Drawer.Screen name={DRAWER_ROUTES.MAIN_TABS} component={MainTabsNavigator} />
      <Drawer.Screen name={DRAWER_ROUTES.CATEGORY_STACK} component={CategoryStackNavigator} />
    </Drawer.Navigator>
  );
}
