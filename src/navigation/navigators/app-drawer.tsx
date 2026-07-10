import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { NavigationState, ParamListBase, PartialState, RouteProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { AppDrawerContent, type DrawerItemKey } from '../components/app-drawer-content';
import { ShellDrawerContext } from '../components/shell-drawer-context';
import type { AppDrawerParamList } from '../navigation-types';
import { CATEGORY_ROUTES, DRAWER_ROUTES, EMPLOYEE_ROUTES, HOME_ROUTES, REPORT_ROUTES, ROOT_ROUTES, SETTING_ROUTES, TAB_ROUTES } from '../route-names';
import { CategoryStackNavigator } from './category-stack';
import { MainTabsNavigator } from './main-tabs';

const Stack = createNativeStackNavigator<AppDrawerParamList>();

const shellMetrics = {
  cardCornerRadius: 28,
  cardScale: 0.8,
  cardTranslateY: 20,
  drawerPanelWidthRatio: 0.72,
} as const;

type MainTabsDrawerScreenProps = NativeStackScreenProps<AppDrawerParamList, typeof DRAWER_ROUTES.MAIN_TABS>;
type CategoryDrawerScreenProps = NativeStackScreenProps<AppDrawerParamList, typeof DRAWER_ROUTES.CATEGORY_STACK>;
type AppShellFrameProps = {
  children: ReactNode;
  navigation: MainTabsDrawerScreenProps['navigation'] | CategoryDrawerScreenProps['navigation'];
  route: MainTabsDrawerScreenProps['route'] | CategoryDrawerScreenProps['route'];
};

function MainTabsDrawerScreen({ navigation, route }: MainTabsDrawerScreenProps) {
  return (
    <AppShellFrame navigation={navigation} route={route}>
      <MainTabsNavigator />
    </AppShellFrame>
  );
}

function CategoryDrawerScreen({ navigation, route }: CategoryDrawerScreenProps) {
  return (
    <AppShellFrame navigation={navigation} route={route}>
      <CategoryStackNavigator />
    </AppShellFrame>
  );
}

export function AppDrawerNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={DRAWER_ROUTES.MAIN_TABS}
      screenOptions={{ animation: 'none', contentStyle: { backgroundColor: 'transparent' }, headerShown: false }}
    >
      <Stack.Screen name={DRAWER_ROUTES.MAIN_TABS} component={MainTabsDrawerScreen} />
      <Stack.Screen name={DRAWER_ROUTES.CATEGORY_STACK} component={CategoryDrawerScreen} />
    </Stack.Navigator>
  );
}

function AppShellFrame({ children, navigation, route }: AppShellFrameProps) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const activeLeafRouteName = getActiveShellRouteName(route);
  const activeItemKey = getActiveDrawerItemKey(activeLeafRouteName);
  const drawerPanelWidth = width * shellMetrics.drawerPanelWidthRatio;

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [activeLeafRouteName]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isDrawerOpen ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isDrawerOpen, progress]);

  const translateX = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, drawerPanelWidth - 24],
      }),
    [drawerPanelWidth, progress],
  );

  const translateY = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, shellMetrics.cardTranslateY],
      }),
    [progress],
  );

  const scale = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: [1, shellMetrics.cardScale],
      }),
    [progress],
  );

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  function openDrawer() {
    setIsDrawerOpen(true);
  }

  function toggleDrawer() {
    setIsDrawerOpen((value) => !value);
  }

  function navigateTo(itemKey: DrawerItemKey) {
    switch (itemKey) {
      case 'home':
        navigation.navigate(DRAWER_ROUTES.MAIN_TABS, {
          screen: TAB_ROUTES.HOME_STACK,
          params: { screen: HOME_ROUTES.HOME },
        });
        break;
      case 'scan':
        navigation.getParent()?.navigate(ROOT_ROUTES.SCAN_STACK);
        break;
      case 'report':
        navigation.navigate(DRAWER_ROUTES.MAIN_TABS, {
          screen: TAB_ROUTES.REPORT_STACK,
          params: { screen: REPORT_ROUTES.REPORT },
        });
        break;
      case 'category':
        navigation.navigate(DRAWER_ROUTES.CATEGORY_STACK, {
          screen: CATEGORY_ROUTES.CATEGORY,
        });
        break;
      case 'employee':
        navigation.navigate(DRAWER_ROUTES.MAIN_TABS, {
          screen: TAB_ROUTES.EMPLOYEE_STACK,
          params: { screen: EMPLOYEE_ROUTES.EMPLOYEE },
        });
        break;
      case 'myAccount':
        navigation.navigate(DRAWER_ROUTES.MAIN_TABS, {
          screen: TAB_ROUTES.SETTING_STACK,
          params: { screen: SETTING_ROUTES.MY_ACCOUNT },
        });
        break;
      case 'setting':
        navigation.navigate(DRAWER_ROUTES.MAIN_TABS, {
          screen: TAB_ROUTES.SETTING_STACK,
          params: { screen: SETTING_ROUTES.SETTING },
        });
        break;
      case 'map':
        navigation.navigate(DRAWER_ROUTES.MAIN_TABS, {
          screen: TAB_ROUTES.SETTING_STACK,
          params: { screen: SETTING_ROUTES.MAP },
        });
        break;
      case 'help':
        navigation.navigate(DRAWER_ROUTES.MAIN_TABS, {
          screen: TAB_ROUTES.SETTING_STACK,
          params: { screen: SETTING_ROUTES.HELP },
        });
        break;
      case 'aboutUs':
        navigation.navigate(DRAWER_ROUTES.MAIN_TABS, {
          screen: TAB_ROUTES.SETTING_STACK,
          params: { screen: SETTING_ROUTES.ABOUT_US },
        });
        break;
      default:
        break;
    }

    closeDrawer();
  }

  const drawerContextValue = useMemo(
    () => ({
      closeDrawer,
      isDrawerOpen,
      openDrawer,
      toggleDrawer,
    }),
    [isDrawerOpen],
  );

  return (
    <ShellDrawerContext.Provider value={drawerContextValue}>
      <View style={styles.shell}>
        <View style={[styles.drawerPanel, { width: drawerPanelWidth }]}>
          <AppDrawerContent activeItemKey={activeItemKey} onClose={closeDrawer} onNavigate={navigateTo} />
        </View>

        <Animated.View
          pointerEvents={isDrawerOpen ? 'none' : 'auto'}
          style={[
            styles.foregroundLayer,
            {
              transform: [{ translateX }, { translateY }, { scale }],
            },
          ]}
        >
          <View style={[styles.cardShadow, isDrawerOpen ? styles.cardShadowOpen : null]}>
            <View style={[styles.card, isDrawerOpen ? styles.cardOpen : null]}>{children}</View>
          </View>
        </Animated.View>
      </View>
    </ShellDrawerContext.Provider>
  );
}

function getActiveDrawerItemKey(activeLeafName: string): DrawerItemKey | null {
  switch (activeLeafName) {
    case HOME_ROUTES.HOME:
    case TAB_ROUTES.HOME_STACK:
      return 'home';
    case REPORT_ROUTES.REPORT:
    case TAB_ROUTES.REPORT_STACK:
      return 'report';
    case CATEGORY_ROUTES.CATEGORY:
    case DRAWER_ROUTES.CATEGORY_STACK:
      return 'category';
    case EMPLOYEE_ROUTES.EMPLOYEE:
    case EMPLOYEE_ROUTES.EMPLOYEE_DETAIL:
    case TAB_ROUTES.EMPLOYEE_STACK:
      return 'employee';
    case SETTING_ROUTES.SETTING:
    case TAB_ROUTES.SETTING_STACK:
      return 'setting';
    case SETTING_ROUTES.MY_ACCOUNT:
      return 'myAccount';
    case SETTING_ROUTES.MAP:
      return 'map';
    case SETTING_ROUTES.HELP:
      return 'help';
    case SETTING_ROUTES.ABOUT_US:
      return 'aboutUs';
    default:
      return null;
  }
}

function getActiveShellRouteName(route: RouteProp<AppDrawerParamList, keyof AppDrawerParamList>) {
  const routeState = (route as RouteProp<AppDrawerParamList, keyof AppDrawerParamList> & {
    params?: unknown;
    state?: NavigationState<ParamListBase> | PartialState<NavigationState<ParamListBase>>;
  }).state;

  if (routeState) {
    return getActiveRouteName(routeState);
  }

  const paramRoute = getActiveRouteNameFromParams((route as { params?: unknown }).params);

  if (paramRoute) {
    return paramRoute;
  }

  switch (route.name) {
    case DRAWER_ROUTES.CATEGORY_STACK:
      return CATEGORY_ROUTES.CATEGORY;
    case DRAWER_ROUTES.MAIN_TABS:
      return HOME_ROUTES.HOME;
    default:
      return route.name;
  }
}

function getActiveRouteName(state: NavigationState<ParamListBase> | PartialState<NavigationState<ParamListBase>>): string {
  const route = state.routes[state.index ?? 0];
  const nestedState = route.state as NavigationState<ParamListBase> | PartialState<NavigationState<ParamListBase>> | undefined;

  if (nestedState) {
    return getActiveRouteName(nestedState);
  }

  const paramRoute = getActiveRouteNameFromParams(route.params);

  if (paramRoute) {
    return paramRoute;
  }

  return route.name;
}

function getActiveRouteNameFromParams(params: unknown): string | null {
  if (!params || typeof params !== 'object' || !('screen' in params)) {
    return null;
  }

  const screenName = typeof params.screen === 'string' ? params.screen : null;
  const nestedScreenName = getActiveRouteNameFromParams('params' in params ? params.params : undefined);

  return nestedScreenName ?? screenName;
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    shell: {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: theme.colors.secondary,
    },
    drawerPanel: {
      flex: 1,
      maxWidth: '100%',
    },
    foregroundLayer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    cardShadow: {
      flex: 1,
    },
    cardShadowOpen: {
      borderRadius: shellMetrics.cardCornerRadius,
      borderCurve: 'continuous',
      boxShadow: '0 18px 40px rgba(0, 0, 0, 0.22)',
    },
    card: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    cardOpen: {
      overflow: 'hidden',
      borderRadius: shellMetrics.cardCornerRadius,
      borderCurve: 'continuous',
    },
  });
}
