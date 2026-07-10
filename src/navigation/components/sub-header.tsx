import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

type SubHeaderProps = {
  onBackPress: () => void;
  rightSlot?: ReactNode;
  title: string;
};

export function SubHeader({ onBackPress, rightSlot, title }: SubHeaderProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top);

  return (
    <View style={styles.container}>
      <View style={[styles.sideSlot, styles.sideSlotLeft]}>
        <Pressable onPress={onBackPress} style={styles.iconButtonPressable}>
          {({ pressed }) => (
            <View style={[styles.iconButton, pressed ? styles.buttonPressed : null]}>
              <HugeiconsIcon color={theme.colors.primary} icon={ArrowLeft01Icon} size={22} strokeWidth={2.2} />
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.centerContent}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>

      <View style={[styles.sideSlot, styles.sideSlotRight]}>{rightSlot}</View>
    </View>
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
    buttonPressed: {
      opacity: 0.9,
    },
  });
}
