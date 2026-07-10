import { memo, useMemo } from 'react';
import { AppIcon } from '@/shared/ui/icon';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/mock/home-data';
import type { ProgressItem } from '@/mock/report-data';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';
import { AppTheme } from '@/shared/theme';

type TransactionProgressCardProps = ProgressItem;

export const TransactionProgressCard = memo(function TransactionProgressCard({
  amount,
  color,
  icon,
  percentage,
  progress,
  title,
  trackColor,
}: TransactionProgressCardProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const progressWidth = `${Math.max(0, Math.min(progress, 1)) * 100}%` as `${number}%`;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AppIcon icon={icon} size={24} color={theme.colors.primary} strokeWidth={1.8} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
            <View style={[styles.progressFill, { backgroundColor: color, width: progressWidth }]} />
          </View>
          <Text style={styles.percentage}>{percentage.toFixed(2)}%</Text>
        </View>
      </View>
    </View>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 52,
      height: 52,
      padding: spacing.xs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    title: {
      flex: 1,
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    amount: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
      gap: spacing.sm,
    },
    progressTrack: {
      flex: 1,
      height: 10,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      overflow: 'hidden',
      justifyContent: 'center',
    },
    progressFill: {
      height: '100%',
      borderRadius: radius.pill,
      borderCurve: 'continuous',
    },
    percentage: {
      ...typography.labelLarge,
      color: theme.colors.textHint,
      fontFamily: typography.titleMedium.fontFamily,
    },
  });
}
