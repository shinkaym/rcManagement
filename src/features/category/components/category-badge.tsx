import { memo, useMemo } from 'react';
import { AppIcon } from '@/shared/ui/icon';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  expenseCategoryIconCatalog,
  resolveExpenseCategoryIconCode,
} from '@/features/category/model/category-icon';
import type { ExpenseCategory } from '@/features/category/model/category.types';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { radius } from '@/shared/theme/tokens/radius';
import { toSoftColor } from '@/shared/utils/color';

type CategoryBadgeProps = {
  category: ExpenseCategory;
  onPress?: () => void;
};

export const CategoryBadge = memo(function CategoryBadgeComponent({ category, onPress }: CategoryBadgeProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconCode = resolveExpenseCategoryIconCode(category);
  const iconPreset = expenseCategoryIconCatalog[iconCode];
  const colorValue = category.color ?? theme.colors.primary;

  const badgeContent = (
    <View style={[styles.badge, { backgroundColor: toSoftColor(colorValue) }]}>
      <AppIcon icon={iconPreset.icon} color={colorValue} size={20} strokeWidth={1.9} />
    </View>
  );

  if (!onPress) {
    return badgeContent;
  }

  return (
    <Pressable onPress={onPress} style={styles.badgePressable}>
      {({ pressed }) => <View style={pressed ? styles.badgePressed : null}>{badgeContent}</View>}
    </Pressable>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    badgePressable: {
      borderRadius: radius.lg,
    },
    badgePressed: {
      opacity: 0.9,
    },
    badge: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: 'rgba(87, 66, 53, 0.10)',
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceAlt,
    },
  });
}
