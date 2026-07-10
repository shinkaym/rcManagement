import { memo, useMemo } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Settings02Icon } from '@hugeicons/core-free-icons';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';
import { AppIcon } from '@/shared/ui/icon';

type HugeIcon = typeof Settings02Icon;

type ActionCardProps = {
  icon?: HugeIcon;
  imageSource?: ImageSourcePropType;
  label: string;
  onPress: () => void;
  variant?: 'dashed' | 'edit' | 'solid';
};

export const ActionCard = memo(function ActionCardComponent({
  icon,
  imageSource,
  label,
  onPress,
  variant = 'solid',
}: ActionCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable onPress={onPress} style={styles.cardPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            variant === 'dashed' ? styles.cardDashed : null,
            variant === 'edit' ? styles.cardEdit : null,
            pressed ? styles.cardPressed : null,
          ]}
        >
          <View style={[styles.actionBadge, variant === 'edit' ? styles.actionBadgeEdit : null]}>
            {imageSource ? <Image resizeMode='contain' source={imageSource} style={styles.actionImage} /> : null}

            {icon ? (
              <AppIcon
                color={variant === 'edit' ? theme.colors.surface : theme.colors.textSecondary}
                icon={icon}
                size={20}
                strokeWidth={2.2}
              />
            ) : null}
          </View>

          <Text numberOfLines={1} style={styles.cardLabel}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    cardPressable: {
      width: '48%',
      minWidth: 140,
    },
    card: {
      minHeight: 58,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    cardDashed: {
      borderStyle: 'dashed',
      borderColor: theme.colors.border,
    },
    cardEdit: {
      borderColor: theme.colors.border,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }],
    },
    actionBadge: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
    },
    actionBadgeEdit: {
      backgroundColor: theme.colors.tertiary,
      borderColor: theme.colors.tertiary,
    },
    actionImage: {
      width: 22,
      height: 22,
    },
    cardLabel: {
      flex: 1,
      ...typography.bodyMedium,
      fontFamily: typography.titleMedium.fontFamily,
      color: theme.colors.textSecondary,
    },
  });
}
