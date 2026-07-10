import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { categoryIconCatalog, type CategoryItem } from '@/mock/category-data';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';
import { AppIcon } from '@/shared/ui/icon';
import { toSoftColor } from '@/shared/utils/color';

type CategoryCardProps = {
  item: CategoryItem;
  onPressItem: (item: CategoryItem) => void;
};

export const CategoryCard = memo(function CategoryCardComponent({ item, onPressItem }: CategoryCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconPreset = categoryIconCatalog[item.iconKey];

  return (
    <Pressable onPress={() => onPressItem(item)} style={styles.cardPressable}>
      {({ pressed }) => (
        <View style={[styles.card, pressed ? styles.cardPressed : null]}>
          <View style={[styles.iconBadge, { backgroundColor: toSoftColor(item.colorValue) }]}>
            <AppIcon color={item.colorValue} icon={iconPreset.icon} size={20} strokeWidth={2.2} />
          </View>

          <Text numberOfLines={1} style={styles.cardLabel}>
            {item.label}
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
      boxShadow: theme.shadow.lifted,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }],
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
