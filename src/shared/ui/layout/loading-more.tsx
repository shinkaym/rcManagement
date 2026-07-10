import { memo, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

type LoadingMoreProps = {
  label?: string;
};

export const LoadingMore = memo(function LoadingMoreComponent({
  label = 'Loading more...',
}: LoadingMoreProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.primary} size='small' />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
      gap: spacing.xs,
    },
    label: {
      ...typography.bodyMedium,
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
  });
}
