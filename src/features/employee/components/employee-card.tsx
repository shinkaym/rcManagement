import { memo, useMemo } from 'react';
import { PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { AppIcon } from '@/shared/ui/icon';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Employee } from '@/features/employee/model/employee.types';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

import { AppTheme } from '@/shared/theme';

export { EmployeeCardSkeleton } from './employee-card-skeleton';

type EmployeeCardProps = {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
};

export const EmployeeCard = memo(function EmployeeCardComponent({ employee, onEdit }: EmployeeCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const statusLabel = employee.status === 'ACTIVE' ? 'Active' : 'Inactive';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.statusPill,
              employee.status === 'ACTIVE' ? styles.statusOptionActive : styles.statusOptionInactive,
            ]}
          >
            <Text numberOfLines={1} style={styles.statusText}>
              {statusLabel}
            </Text>
          </View>

          <Text numberOfLines={1} style={styles.name}>
            {employee.name}
          </Text>
        </View>

        <Text numberOfLines={2} style={styles.note}>
          {employee.note?.trim() || 'No note'}
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
});

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
    headerRow: {
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
    note: {
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
