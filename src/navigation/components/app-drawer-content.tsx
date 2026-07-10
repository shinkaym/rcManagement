import {
  Cancel01Icon,
  GridViewIcon,
  HelpCircleIcon,
  Home01Icon,
  InformationCircleIcon,
  MapsIcon,
  ReceiptTextIcon,
  Settings02Icon,
  UserAccountIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import type { NavigationState, ParamListBase, PartialState } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

import { CATEGORY_ROUTES, DRAWER_ROUTES, EMPLOYEE_ROUTES, HOME_ROUTES, REPORT_ROUTES, SETTING_ROUTES, TAB_ROUTES } from '../route-names';

type DrawerItemKey =
  | 'home'
  | 'report'
  | 'category'
  | 'employee'
  | 'myAccount'
  | 'setting'
  | 'map'
  | 'help'
  | 'aboutUs';

const drawerItems: Array<{ icon: typeof Home01Icon; key: DrawerItemKey; label: string }> = [
  { key: 'home', label: 'Home', icon: Home01Icon },
  { key: 'report', label: 'Report', icon: ReceiptTextIcon },
  { key: 'category', label: 'Category', icon: GridViewIcon },
  { key: 'employee', label: 'Employee', icon: UserGroupIcon },
  { key: 'myAccount', label: 'My Account', icon: UserAccountIcon },
  { key: 'setting', label: 'Setting', icon: Settings02Icon },
  { key: 'map', label: 'Map', icon: MapsIcon },
  { key: 'help', label: 'Help', icon: HelpCircleIcon },
  { key: 'aboutUs', label: 'About Us', icon: InformationCircleIcon },
];

export function AppDrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);
  const activeItemKey = getActiveDrawerItemKey(state);

  function navigateTo(itemKey: DrawerItemKey) {
    switch (itemKey) {
      case 'home':
        navigation.navigate(DRAWER_ROUTES.MAIN_TABS, {
          screen: TAB_ROUTES.HOME_STACK,
          params: { screen: HOME_ROUTES.HOME },
        });
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

    navigation.closeDrawer();
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.closeDrawer()} style={styles.closeButtonPressable}>
        {({ pressed }) => (
          <View style={[styles.closeButton, pressed ? styles.closeButtonPressed : null]}>
            <HugeiconsIcon color='#FFFFFF' icon={Cancel01Icon} size={26} strokeWidth={2.6} />
          </View>
        )}
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.name}>Charlie Puth</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {drawerItems.map((item) => {
          const isSelected = item.key === activeItemKey;

          return (
            <Pressable key={item.key} onPress={() => navigateTo(item.key)} style={styles.itemPressable}>
              {({ pressed }) => (
                <View style={[styles.item, isSelected ? styles.itemSelected : null, pressed ? styles.itemPressed : null]}>
                  <HugeiconsIcon color='#FFFFFF' icon={item.icon} size={18} strokeWidth={2.4} />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function getActiveDrawerItemKey(state: DrawerContentComponentProps['state']): DrawerItemKey | null {
  const activeLeafName = getActiveRouteName(state);

  switch (activeLeafName) {
    case HOME_ROUTES.HOME:
      return 'home';
    case REPORT_ROUTES.REPORT:
      return 'report';
    case CATEGORY_ROUTES.CATEGORY:
      return 'category';
    case EMPLOYEE_ROUTES.EMPLOYEE:
    case EMPLOYEE_ROUTES.EMPLOYEE_DETAIL:
      return 'employee';
    case SETTING_ROUTES.SETTING:
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

function getActiveRouteName(state: NavigationState<ParamListBase> | PartialState<NavigationState<ParamListBase>>): string {
  const route = state.routes[state.index ?? 0];
  const nestedState = route.state as NavigationState<ParamListBase> | PartialState<NavigationState<ParamListBase>> | undefined;

  if (nestedState) {
    return getActiveRouteName(nestedState);
  }

  return route.name;
}

function createStyles(theme: ReturnType<typeof useAppTheme>, topInset: number, bottomInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.secondary,
      paddingTop: topInset > 0 ? topInset + spacing.md : spacing.xl,
      paddingRight: spacing.xl,
      paddingBottom: bottomInset > 0 ? bottomInset + spacing.lg : spacing.xl,
      paddingLeft: spacing.xl,
    },
    closeButtonPressable: {
      alignSelf: 'flex-start',
      borderRadius: radius.pill,
    },
    closeButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonPressed: {
      opacity: 0.85,
    },
    header: {
      marginTop: spacing.xxl,
      gap: 2,
    },
    greeting: {
      ...typography.bodyLarge,
      color: '#FFFFFF',
    },
    name: {
      ...typography.titleLarge,
      fontSize: 20,
      lineHeight: 26,
      color: '#FFFFFF',
    },
    list: {
      flex: 1,
      marginTop: spacing.lg,
    },
    listContent: {
      paddingRight: spacing.lg,
      gap: spacing.xs,
    },
    itemPressable: {
      borderRadius: radius.md,
      borderCurve: 'continuous',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
    },
    itemSelected: {
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    itemPressed: {
      opacity: 0.9,
    },
    itemLabel: {
      ...typography.bodyMedium,
      color: '#FFFFFF',
      fontFamily: typography.titleMedium.fontFamily,
      fontSize: 15,
      lineHeight: 20,
    },
  });
}
