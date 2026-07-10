import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { navigationMetrics } from '@/navigation/navigation-metrics';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

type FeaturePlaceholderScreenProps = {
  description: string;
  title: string;
  withBottomNavSpacing?: boolean;
};

export function FeaturePlaceholderScreen({
  description,
  title,
  withBottomNavSpacing = false,
}: FeaturePlaceholderScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, withBottomNavSpacing);

  return (
    <>
      <StatusBar barStyle='dark-content' />
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        style={styles.screen}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </ScrollView>
    </>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, withBottomNavSpacing: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: withBottomNavSpacing
        ? navigationMetrics.bottomNavHeight +
          navigationMetrics.centerActionSize / 2 +
          navigationMetrics.centerActionGap +
          navigationMetrics.centerActionLabelHeight +
          spacing.sm
        : spacing.xl,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      gap: spacing.sm,
    },
    title: {
      ...typography.headlineMedium,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    description: {
      ...typography.bodyLarge,
      color: theme.colors.textHint,
      textAlign: 'center',
    },
  });
}
