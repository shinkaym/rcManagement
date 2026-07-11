import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { staticColors } from '@/shared/theme/tokens/colors';
import { typography } from '@/shared/theme/tokens/typography';
import { AppIcon, type AppIconProps } from '@/shared/ui/icon';

type AppButtonVariant = 'primary' | 'secondary';
type AppButtonSize = 'md' | 'lg';

type AppButtonProps = {
  disabled?: boolean;
  icon?: AppIconProps['icon'];
  iconPosition?: 'left' | 'right';
  label: string;
  onPress?: () => void;
  size?: AppButtonSize;
  style?: StyleProp<ViewStyle>;
  variant?: AppButtonVariant;
};

export const AppButton = memo(function AppButtonComponent({
  disabled = false,
  icon,
  iconPosition = 'left',
  label,
  onPress,
  size = 'md',
  style,
  variant = 'primary',
}: AppButtonProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isPrimary = variant === 'primary';
  const iconColor = isPrimary ? staticColors.white : theme.colors.secondary;

  const iconNode = icon ? <AppIcon icon={icon} size={18} color={iconColor} strokeWidth={2} /> : null;

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.pressable, style]}>
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            size === 'lg' ? styles.buttonLarge : null,
            isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
            disabled ? styles.buttonDisabled : null,
            pressed && !disabled ? styles.buttonPressed : null,
          ]}
        >
          {iconPosition === 'left' ? iconNode : null}
          <Text
            style={[
              styles.label,
              isPrimary ? styles.labelPrimary : styles.labelSecondary,
              disabled ? styles.labelDisabled : null,
            ]}
          >
            {label}
          </Text>
          {iconPosition === 'right' ? iconNode : null}
        </View>
      )}
    </Pressable>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    pressable: {
      borderRadius: radius.lg,
    },
    button: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1.5,
    },
    buttonLarge: {
      minHeight: 52,
    },
    buttonPrimary: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
      boxShadow: theme.shadow.accentStrong,
    },
    buttonSecondary: {
      borderColor: theme.colors.secondary,
      backgroundColor: theme.colors.surface,
    },
    buttonDisabled: {
      opacity: 0.56,
    },
    buttonPressed: {
      opacity: 0.9,
    },
    label: {
      ...typography.titleMedium,
    },
    labelPrimary: {
      color: staticColors.white,
    },
    labelSecondary: {
      color: theme.colors.secondary,
    },
    labelDisabled: {
      color: theme.colors.textHint,
    },
  });
}
