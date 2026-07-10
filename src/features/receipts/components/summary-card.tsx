import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';
import { AppTheme } from '@/shared/theme';

type SummaryCardProps = {
  amount: string;
  label: string;
};

export function SummaryCard({ amount, label }: SummaryCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      padding: spacing.md,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.secondary,
    },
    label: {
      ...typography.labelLarge,
      color: theme.colors.textTertiarySoft,
      fontFamily: typography.titleMedium.fontFamily,
      letterSpacing: 0.8,
    },
    amount: {
      ...typography.displayLarge,
      marginTop: spacing.xs,
      color: theme.colors.surface,
    },
  });
}
