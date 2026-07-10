import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';

type EmployeeCardSkeletonProps = {
  withSpacing?: boolean;
};

export const EmployeeCardSkeleton = memo(function EmployeeCardSkeletonComponent({
  withSpacing = false,
}: EmployeeCardSkeletonProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
