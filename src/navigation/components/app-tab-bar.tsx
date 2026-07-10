import { Home01Icon, ReceiptTextIcon, ScanImageIcon, Settings02Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { AppIcon } from '@/shared/ui/icon';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

import { navigationMetrics } from '../navigation-metrics';
import { ROOT_ROUTES, TAB_ROUTES } from '../route-names';
import { AppTheme } from '@/shared/theme';

const tabVisualConfig = {
  [TAB_ROUTES.HOME_STACK]: { icon: Home01Icon, label: 'Home' },
  [TAB_ROUTES.REPORT_STACK]: { icon: ReceiptTextIcon, label: 'Report' },
  [TAB_ROUTES.EMPLOYEE_STACK]: { icon: UserGroupIcon, label: 'Employee' },
  [TAB_ROUTES.SETTING_STACK]: { icon: Settings02Icon, label: 'Setting' },
} as const;

export function AppTabBar({ navigation, state }: BottomTabBarProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.bottom);
  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  function openScanFlow() {
    navigation.getParent()?.getParent()?.navigate(ROOT_ROUTES.SCAN_STACK);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {leftRoutes.map((route) => {
          const routeIndex = state.routes.findIndex((item) => item.key === route.key);
          const config = tabVisualConfig[route.name as keyof typeof tabVisualConfig];
          const isFocused = state.index === routeIndex;

          return (
            <View key={route.key} style={styles.navSlot}>
              <TabBarItem
                icon={config.icon}
                isFocused={isFocused}
                label={config.label}
                onPress={() => navigation.navigate(route.name, route.params)}
              />
            </View>
          );
        })}

        <View style={styles.centerGap} />

        {rightRoutes.map((route) => {
          const routeIndex = state.routes.findIndex((item) => item.key === route.key);
          const config = tabVisualConfig[route.name as keyof typeof tabVisualConfig];
          const isFocused = state.index === routeIndex;

          return (
            <View key={route.key} style={styles.navSlot}>
              <TabBarItem
                icon={config.icon}
                isFocused={isFocused}
                label={config.label}
                onPress={() => navigation.navigate(route.name, route.params)}
              />
            </View>
          );
        })}
      </View>

      <View pointerEvents='box-none' style={styles.centerActionOverlay}>
        <Pressable onPress={openScanFlow} style={styles.centerActionPressable}>
          {({ pressed }) => (
            <View style={styles.centerActionWrapper}>
              <View style={[styles.centerActionButton, pressed ? styles.itemPressed : null]}>
                <AppIcon color={staticColors.white} icon={ScanImageIcon} size={30} strokeWidth={2.1} />
              </View>
              <Text style={styles.centerActionLabel}>Scan</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

type TabBarItemProps = {
  icon: typeof Home01Icon;
  isFocused: boolean;
  label: string;
  onPress: () => void;
};

function TabBarItem({ icon, isFocused, label, onPress }: TabBarItemProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0);
  const color = isFocused ? theme.colors.primary : 'rgba(0, 0, 0, 0.87)';

  return (
    <Pressable onPress={onPress} style={styles.itemPressable}>
      {({ pressed }) => (
        <View style={[styles.itemContent, pressed ? styles.itemPressed : null]}>
          <AppIcon color={color} icon={icon} size={24} strokeWidth={1.9} />
          <Text style={[styles.itemLabel, { color }, isFocused ? styles.itemLabelActive : null]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: AppTheme, bottomInset: number) {
  return StyleSheet.create({
    wrapper: {
      backgroundColor: staticColors.transparent,
    },
    container: {
      height: navigationMetrics.bottomNavHeight + bottomInset,
      paddingBottom: bottomInset > 0 ? bottomInset : spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      boxShadow: theme.shadow.bottomBar,
    },
    navSlot: {
      flex: 1,
    },
    centerGap: {
      width: 72,
    },
    itemPressable: {
      borderRadius: 12,
    },
    itemContent: {
      paddingVertical: 6,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xxs,
    },
    itemPressed: {
      opacity: 0.85,
    },
    itemLabel: {
      ...typography.labelLarge,
      textAlign: 'center',
    },
    itemLabelActive: {
      fontFamily: typography.titleMedium.fontFamily,
    },
    centerActionOverlay: {
      position: 'absolute',
      right: 0,
      bottom: bottomInset > 0 ? bottomInset + spacing.xs : spacing.sm,
      left: 0,
      alignItems: 'center',
    },
    centerActionPressable: {
      borderRadius: radius.pill,
    },
    centerActionWrapper: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    centerActionButton: {
      width: navigationMetrics.centerActionSize,
      height: navigationMetrics.centerActionSize,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: theme.colors.primary,
      boxShadow: theme.shadow.fab,
    },
    centerActionLabel: {
      ...typography.labelLarge,
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: typography.titleMedium.fontFamily,
      lineHeight: navigationMetrics.centerActionLabelHeight,
    },
  });
}
