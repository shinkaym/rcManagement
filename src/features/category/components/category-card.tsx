import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveExpenseCategoryIconCode, expenseCategoryIconCatalog } from '@/features/category/model/category-icon';
import type { ExpenseCategory } from '@/features/category/model/category.types';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';
import { AppIcon } from '@/shared/ui/icon';
import { toSoftColor } from '@/shared/utils/color';

type CategoryCardProps = {
  disabled?: boolean;
  item: ExpenseCategory;
  onPressItem?: (item: ExpenseCategory) => void;
};

export const CategoryCard = memo(function CategoryCardComponent({
  disabled = false,
  item,
  onPressItem,
}: CategoryCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconCode = resolveExpenseCategoryIconCode(item);
  const iconPreset = expenseCategoryIconCatalog[iconCode];
  const colorValue = item.color ?? theme.colors.primary;

  return (
    <Pressable
      disabled={disabled || !onPressItem}
      onPress={onPressItem ? () => onPressItem(item) : undefined}
      style={styles.cardPressable}
    >
      {({ pressed }) => (
        <View style={[styles.card, disabled ? styles.cardDisabled : null, pressed ? styles.cardPressed : null]}>
          <View style={[styles.iconBadge, { backgroundColor: toSoftColor(colorValue) }]}>
            <AppIcon color={colorValue} icon={iconPreset.icon} size={20} strokeWidth={2.2} />
          </View>

          <Text numberOfLines={1} style={styles.cardLabel}>
            {item.name}
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
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }],
    },
    cardDisabled: {
      opacity: 0.72,
    },
    iconBadge: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(25, 28, 29, 0.08)',
    },
    cardLabel: {
      flex: 1,
      ...typography.bodyMedium,
      fontFamily: typography.titleMedium.fontFamily,
      color: theme.colors.textSecondary,
    },
  });
}
