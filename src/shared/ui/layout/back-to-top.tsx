import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';

type BackToTopProps = {
  actionLabel?: string;
  message: string;
  onPress?: () => void;
  showDivider?: boolean;
};

export const BackToTop = memo(function BackToTopComponent({
  actionLabel = 'Back to top',
  message,
  onPress,
  showDivider = true,
}: BackToTopProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {showDivider ? <View style={styles.divider} /> : null}

      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>

        {onPress ? (
          <Pressable onPress={onPress} style={styles.actionPressable}>
            {({ pressed }) => (
              <Text style={[styles.actionText, pressed ? styles.actionTextPressed : null]}>{actionLabel}</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      marginTop: spacing.xl,
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(245, 124, 0, 0.16)',
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
      gap: spacing.xs,
    },
    message: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    actionPressable: {
      borderRadius: radius.pill,
    },
    actionText: {
      ...typography.bodyMedium,
      color: theme.colors.primary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    actionTextPressed: {
      opacity: 0.72,
    },
  });
}
