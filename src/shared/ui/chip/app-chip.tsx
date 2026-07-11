import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';
import { AppIcon, type AppIconProps } from '@/shared/ui/icon';

type AppChipVariant = 'dashed' | 'outline' | 'soft';

type AppChipProps = {
  icon?: AppIconProps['icon'];
  isSelected?: boolean;
  label: string;
  onPress?: () => void;
  onRemove?: () => void;
  variant?: AppChipVariant;
};

export const AppChip = memo(function AppChipComponent({
  icon,
  isSelected = false,
  label,
  onPress,
  onRemove,
  variant = 'soft',
}: AppChipProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const chipContent = (
    <View
      style={[
        styles.chip,
        variant === 'outline' ? styles.chipOutline : null,
        variant === 'dashed' ? styles.chipDashed : null,
        isSelected ? styles.chipSelected : null,
      ]}
    >
      {icon ? (
        <AppIcon
          icon={icon}
          color={isSelected ? theme.colors.surface : theme.colors.secondary}
          size={14}
          strokeWidth={1.9}
        />
      ) : null}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          variant === 'dashed' ? styles.labelDashed : null,
          isSelected ? styles.labelSelected : null,
        ]}
      >
        {label}
      </Text>

      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={6} style={styles.removePressable}>
          {({ pressed }) => (
            <View style={pressed ? styles.removePressed : null}>
              <AppIcon
                icon={Cancel01Icon}
                color={isSelected ? theme.colors.surface : theme.colors.textSecondary}
                size={12}
                strokeWidth={2}
              />
            </View>
          )}
        </Pressable>
      ) : null}
    </View>
  );

  if (!onPress) {
    return chipContent;
  }

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      {({ pressed }) => <View style={pressed ? styles.pressed : null}>{chipContent}</View>}
    </Pressable>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    pressable: {
      borderRadius: radius.pill,
      alignSelf: 'flex-start',
    },
    pressed: {
      opacity: 0.86,
    },
    chip: {
      minHeight: 36,
      maxWidth: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xxs,
      paddingLeft: spacing.md,
      paddingRight: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
    },
    chipOutline: {
      backgroundColor: theme.colors.surface,
    },
    chipDashed: {
      backgroundColor: theme.colors.surface,
      borderStyle: 'dashed',
    },
    chipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    label: {
      ...typography.labelLarge,
      color: theme.colors.textSecondary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    labelDashed: {
      color: theme.colors.secondary,
    },
    labelSelected: {
      color: theme.colors.surface,
    },
    removePressable: {
      borderRadius: radius.pill,
      marginLeft: 2,
    },
    removePressed: {
      opacity: 0.72,
    },
  });
}
