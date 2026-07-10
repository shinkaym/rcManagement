import { useMemo } from 'react';
import { PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { AppIcon } from '@/shared/ui/icon';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

import type { EmployeeItem } from '../../../mock/employee-data';
import { AppTheme } from '@/shared/theme';

type EmployeeCardProps = {
  employee: EmployeeItem;
  onEdit?: (employee: EmployeeItem) => void;
};

export function EmployeeCard({ employee, onEdit }: EmployeeCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusLabel = employee.status === 'active' ? 'Active' : 'Inactive';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={[styles.statusPill, employee.status === 'active' ? styles.statusOptionActive : styles.statusOptionInactive]}>
            <Text numberOfLines={1} style={styles.statusText}>
              {statusLabel}
            </Text>
          </View>

          <Text numberOfLines={1} style={styles.name}>
            {employee.name}
          </Text>
        </View>

        <Text numberOfLines={1} style={styles.bio}>
          {employee.bio}
        </Text>
      </View>

      <Pressable hitSlop={8} onPress={() => onEdit?.(employee)} style={styles.editPressable}>
        {({ pressed }) => (
          <View style={pressed ? styles.editButtonPressed : null}>
            <AppIcon icon={PencilEdit02Icon} size={20} color={theme.colors.textSecondary} strokeWidth={2.2} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

type EmployeeCardSkeletonProps = {
  withSpacing?: boolean;
};

export function EmployeeCardSkeleton({ withSpacing = false }: EmployeeCardSkeletonProps) {
  const theme = useAppTheme();
  const styles = createSkeletonStyles(theme);

  return (
    <View style={[styles.container, withSpacing ? styles.containerSpacing : null]}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.pillPlaceholder} />
          <View style={styles.namePlaceholder} />
        </View>

        <View style={styles.bioPlaceholder} />
      </View>

      <View style={styles.iconPlaceholder} />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
    },
    content: {
      flex: 1,
      gap: spacing.xxs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statusPill: {
      maxWidth: 112,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      borderWidth: 1,
    },
    statusOptionActive: {
      borderColor: theme.colors.success,
      backgroundColor: theme.colors.success,
    },
    statusOptionInactive: {
      borderColor: theme.colors.danger,
      backgroundColor: theme.colors.danger,
    },
    statusText: {
      ...typography.labelLarge,
      color: staticColors.white,
      fontFamily: typography.titleMedium.fontFamily,
    },
    name: {
      flex: 1,
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    bio: {
      ...typography.bodyMedium,
      color: theme.colors.textTertiary,
    },
    editPressable: {
      marginLeft: spacing.sm,
      borderRadius: radius.pill,
    },
    editButtonPressed: {
      opacity: 0.72,
    },
  });
}

function createSkeletonStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
    },
    containerSpacing: {
      marginTop: spacing.sm,
    },
    content: {
      flex: 1,
      gap: spacing.xs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    pillPlaceholder: {
      width: 84,
      height: 18,
      borderRadius: radius.sm,
      backgroundColor: 'rgba(148, 163, 184, 0.16)',
    },
    namePlaceholder: {
      width: 96,
      height: 18,
      borderRadius: radius.sm,
      backgroundColor: 'rgba(148, 163, 184, 0.16)',
    },
    bioPlaceholder: {
      width: '88%',
      height: 16,
      borderRadius: radius.sm,
      backgroundColor: 'rgba(148, 163, 184, 0.16)',
    },
    iconPlaceholder: {
      width: 20,
      height: 20,
      marginLeft: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: 'rgba(148, 163, 184, 0.16)',
    },
  });
}
