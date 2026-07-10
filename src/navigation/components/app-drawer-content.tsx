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
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

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

export function AppDrawerContent({ activeItemKey, onClose, onNavigate }: AppDrawerContentProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);

  return (
    <View style={styles.container}>
      <Pressable onPress={onClose} style={styles.closeButtonPressable}>
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
            <Pressable key={item.key} onPress={() => onNavigate(item.key)} style={styles.itemPressable}>
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

function createStyles(theme: ReturnType<typeof useAppTheme>, topInset: number, bottomInset: number) {
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
      color: '#FFFFFF',
      fontFamily: typography.titleMedium.fontFamily,
      fontSize: 15,
      lineHeight: 20,
    },
  });
}
