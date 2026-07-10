import { memo, useMemo } from 'react';
import {
  Cancel01Icon,
  GridViewIcon,
  HelpCircleIcon,
  Home01Icon,
  InformationCircleIcon,
  MapsIcon,
  ScanImageIcon,
  ReceiptTextIcon,
  Settings02Icon,
  UserAccountIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';
import { AppIcon } from '@/shared/ui/icon';

export type DrawerItemKey =
  | 'home'
  | 'scan'
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
  { key: 'scan', label: 'Scan Image', icon: ScanImageIcon },
  { key: 'report', label: 'Report', icon: ReceiptTextIcon },
  { key: 'category', label: 'Category', icon: GridViewIcon },
  { key: 'employee', label: 'Employee', icon: UserGroupIcon },
  { key: 'myAccount', label: 'My Account', icon: UserAccountIcon },
  { key: 'setting', label: 'Setting', icon: Settings02Icon },
  { key: 'map', label: 'Map', icon: MapsIcon },
  { key: 'help', label: 'Help', icon: HelpCircleIcon },
  { key: 'aboutUs', label: 'About Us', icon: InformationCircleIcon },
];

type AppDrawerContentProps = {
  activeItemKey: DrawerItemKey | null;
  onClose: () => void;
  onNavigate: (itemKey: DrawerItemKey) => void;
};

type DrawerMenuItemProps = {
  icon: typeof Home01Icon;
  isSelected: boolean;
  itemKey: DrawerItemKey;
  label: string;
  onNavigate: (itemKey: DrawerItemKey) => void;
  styles: ReturnType<typeof createStyles>;
};

const DrawerMenuItem = memo(function DrawerMenuItemComponent({
  icon,
  isSelected,
  itemKey,
  label,
  onNavigate,
  styles,
}: DrawerMenuItemProps) {
  return (
    <Pressable onPress={() => onNavigate(itemKey)} style={styles.itemPressable}>
      {({ pressed }) => (
        <View style={[styles.item, isSelected ? styles.itemSelected : null, pressed ? styles.itemPressed : null]}>
          <AppIcon color={staticColors.white} icon={icon} size={18} strokeWidth={2.4} />
          <Text style={styles.itemLabel}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
});

export const AppDrawerContent = memo(function AppDrawerContentComponent({ activeItemKey, onClose, onNavigate }: AppDrawerContentProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top, insets.bottom), [insets.bottom, insets.top, theme]);

  return (
    <View style={styles.container}>
      <Pressable onPress={onClose} style={styles.closeButtonPressable}>
        {({ pressed }) => (
          <View style={[styles.closeButton, pressed ? styles.closeButtonPressed : null]}>
            <AppIcon color={staticColors.white} icon={Cancel01Icon} size={26} strokeWidth={2.6} />
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
          return (
            <DrawerMenuItem
              key={item.key}
              icon={item.icon}
              isSelected={item.key === activeItemKey}
              itemKey={item.key}
              label={item.label}
              onNavigate={onNavigate}
              styles={styles}
            />
          );
        })}
      </ScrollView>
    </View>
  );
});

function createStyles(theme: AppTheme, topInset: number, bottomInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.secondary,
      paddingTop: topInset > 0 ? topInset + spacing.md : spacing.xl,
      paddingRight: spacing.xl,
      paddingBottom: bottomInset > 0 ? bottomInset + spacing.xl : spacing.xl,
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
      color: staticColors.white,
    },
    name: {
      ...typography.titleLarge,
      fontSize: 20,
      lineHeight: 26,
      color: staticColors.white,
    },
    list: {
      flex: 1,
      marginTop: spacing.lg,
    },
    listContent: {
      paddingRight: spacing.lg,
      gap: spacing.xs,
      paddingBottom: spacing.lg,
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
      color: staticColors.white,
      fontFamily: typography.titleMedium.fontFamily,
      fontSize: 15,
      lineHeight: 20,
    },
  });
}
