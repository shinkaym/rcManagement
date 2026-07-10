import { Calendar03Icon, Menu11Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

type MainHeaderProps = {
  centerChild?: ReactNode;
  onMenuPress: () => void;
  rightSlot?: ReactNode;
  title?: string;
};

type MainHeaderCenterChipProps = {
  label: string;
  onPress?: () => void;
};

export function MainHeader({ centerChild, onMenuPress, rightSlot, title }: MainHeaderProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top);

  return (
    <View style={styles.container}>
      <View style={[styles.sideSlot, styles.sideSlotLeft]}>
        <HeaderIconButton icon={Menu11Icon} onPress={onMenuPress} />
      </View>

      <View style={styles.centerContent}>
        {centerChild ?? (title ? <Text style={styles.title}>{title}</Text> : null)}
      </View>

      <View style={[styles.sideSlot, styles.sideSlotRight]}>{rightSlot}</View>
    </View>
  );
}

export function MainHeaderCenterChip({ label, onPress }: MainHeaderCenterChipProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0);

  return (
    <Pressable onPress={onPress} style={styles.centerChipPressable}>
      {({ pressed }) => (
        <View style={[styles.centerChip, pressed ? styles.buttonPressed : null]}>
          <HugeiconsIcon color={theme.colors.textSecondary} icon={Calendar03Icon} size={18} strokeWidth={1.8} />
          <Text numberOfLines={1} style={styles.centerChipLabel}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

type HeaderIconButtonProps = {
  icon: typeof Menu11Icon;
  onPress: () => void;
};

function HeaderIconButton({ icon, onPress }: HeaderIconButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0);

  return (
    <Pressable onPress={onPress} style={styles.iconButtonPressable}>
      {({ pressed }) => (
        <View style={[styles.iconButton, pressed ? styles.buttonPressed : null]}>
          <HugeiconsIcon color={theme.colors.primary} icon={icon} size={22} strokeWidth={2.2} />
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, topInset: number) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
      paddingTop: topInset > 0 ? topInset + spacing.sm : spacing.lg,
      paddingRight: spacing.lg,
      paddingBottom: spacing.sm,
      paddingLeft: spacing.lg,
      backgroundColor: theme.colors.background,
    },
    sideSlot: {
      minWidth: 44,
      maxWidth: 112,
      minHeight: 44,
      justifyContent: 'center',
    },
    sideSlotLeft: {
      alignItems: 'flex-start',
    },
    sideSlotRight: {
      alignItems: 'flex-end',
    },
    centerContent: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xs,
    },
    title: {
      ...typography.headlineMedium,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    iconButtonPressable: {
      borderRadius: radius.pill,
    },
    iconButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: theme.colors.surface,
      boxShadow: `0 4px 8px ${theme.colors.shadow}`,
    },
    centerChipPressable: {
      borderRadius: radius.sm,
      maxWidth: '100%',
    },
    centerChip: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
      maxWidth: '100%',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      boxShadow: `0 2px 6px ${theme.colors.shadow}`,
    },
    centerChipLabel: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
      fontFamily: typography.titleMedium.fontFamily,
      flexShrink: 1,
      minWidth: 0,
    },
    buttonPressed: {
      opacity: 0.9,
    },
  });
}
