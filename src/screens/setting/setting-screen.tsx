import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

import { SETTING_ROUTES } from '@/navigation/route-names';

export type SettingDestination =
  | typeof SETTING_ROUTES.MY_ACCOUNT
  | typeof SETTING_ROUTES.MAP
  | typeof SETTING_ROUTES.HELP
  | typeof SETTING_ROUTES.ABOUT_US;

const settingLinks = [
  {
    description: 'Manage your personal information and profile preferences.',
    route: SETTING_ROUTES.MY_ACCOUNT,
    title: 'My Account',
  },
  {
    description: 'Open the saved places and location tools tied to your account.',
    route: SETTING_ROUTES.MAP,
    title: 'Map',
  },
  {
    description: 'Reach support resources and current guidance for using the app.',
    route: SETTING_ROUTES.HELP,
    title: 'Help',
  },
  {
    description: 'Read product background and team information.',
    route: SETTING_ROUTES.ABOUT_US,
    title: 'About Us',
  },
] as const;

type SettingScreenProps = {
  onSelectDestination: (destination: SettingDestination) => void;
};

export function SettingScreen({ onSelectDestination }: SettingScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.lead}>Choose a destination to continue deeper into the settings area.</Text>

        <View style={styles.list}>
          {settingLinks.map((item) => (
            <Pressable key={item.route} onPress={() => onSelectDestination(item.route)} style={styles.itemPressable}>
              {({ pressed }) => (
                <View style={[styles.itemCard, pressed ? styles.itemCardPressed : null]}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingTop: spacing.sm,
      paddingRight: spacing.lg,
      paddingBottom: spacing.xl,
      paddingLeft: spacing.lg,
      gap: spacing.md,
    },
    lead: {
      ...typography.bodyLarge,
      color: theme.colors.textHint,
    },
    list: {
      gap: spacing.sm,
    },
    itemPressable: {
      borderRadius: radius.lg,
    },
    itemCard: {
      gap: spacing.xxs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      boxShadow: `0 6px 16px ${theme.colors.shadow}`,
    },
    itemCardPressed: {
      opacity: 0.9,
    },
    itemTitle: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    itemDescription: {
      ...typography.bodyMedium,
      color: theme.colors.textHint,
    },
  });
}
