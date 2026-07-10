import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, Pressable, StyleSheet, Text, View } from 'react-native';

import { ReceiptPreviewScreen } from '@/screens/scan/receipt-preview-screen';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

import { ScanHeader } from '../components/scan-header';
import { SubHeader } from '../components/sub-header';
import type { ScanStackParamList } from '../navigation-types';
import { ROOT_ROUTES, SCAN_ROUTES } from '../route-names';

const Stack = createNativeStackNavigator<ScanStackParamList>();

export function ScanStackNavigator() {
  return (
    <Stack.Navigator initialRouteName={SCAN_ROUTES.SCAN} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCAN_ROUTES.SCAN} component={ScanCaptureRouteScreen} />
      <Stack.Screen name={SCAN_ROUTES.PREVIEW_SCAN} component={PreviewScanRouteScreen} />
    </Stack.Navigator>
  );
}

function ScanCaptureRouteScreen({
  navigation,
}: NativeStackScreenProps<ScanStackParamList, typeof SCAN_ROUTES.SCAN>) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.captureScreen}>
      <StatusBar barStyle='light-content' />
      <View style={styles.captureContent}>
        <ScanHeader
          mode='capture'
          onBackPress={() => navigation.getParent()?.navigate(ROOT_ROUTES.APP_DRAWER)}
          onOpenGallery={() => navigation.navigate(SCAN_ROUTES.PREVIEW_SCAN)}
          onSwitchCamera={() => {}}
          onToggleFlash={() => {}}
        />

        <View style={styles.captureStage}>
          <View style={styles.captureCard}>
            <Text style={styles.captureTitle}>Scan Flow Ready</Text>
            <Text style={styles.captureDescription}>
              The new shell is wired. Camera and media actions from the old Expo flow are intentionally deferred until
              the native replacements are selected.
            </Text>
          </View>
        </View>

        <View style={styles.captureFooter}>
          <Pressable onPress={() => navigation.navigate(SCAN_ROUTES.PREVIEW_SCAN)} style={styles.primaryPressable}>
            {({ pressed }) => (
              <View style={[styles.primaryButton, pressed ? styles.buttonPressed : null]}>
                <Text style={styles.primaryLabel}>Open Mocked Preview</Text>
              </View>
            )}
          </Pressable>

          <Text style={styles.captureHint}>Bottom tabs stay hidden because this flow lives outside MainTabs.</Text>
        </View>
      </View>
    </View>
  );
}

function PreviewScanRouteScreen({
  navigation,
}: NativeStackScreenProps<ScanStackParamList, typeof SCAN_ROUTES.PREVIEW_SCAN>) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.previewScreen}>
      <SubHeader onBackPress={() => navigation.goBack()} title='Preview Scan' />
      <View style={styles.previewContent}>
        <ReceiptPreviewScreen onCancel={() => navigation.goBack()} />
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    captureScreen: {
      flex: 1,
      backgroundColor: '#050607',
    },
    captureContent: {
      flex: 1,
      paddingRight: spacing.lg,
      paddingBottom: spacing.xl,
      paddingLeft: spacing.lg,
    },
    captureStage: {
      flex: 1,
      justifyContent: 'center',
    },
    captureCard: {
      gap: spacing.sm,
      padding: spacing.xl,
      borderRadius: radius.xxl,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    captureTitle: {
      ...typography.titleLarge,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    captureDescription: {
      ...typography.bodyLarge,
      color: 'rgba(255, 255, 255, 0.74)',
      textAlign: 'center',
    },
    captureFooter: {
      gap: spacing.sm,
      paddingTop: spacing.lg,
    },
    primaryPressable: {
      borderRadius: radius.lg,
    },
    primaryButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
    },
    primaryLabel: {
      ...typography.titleMedium,
      color: '#FFFFFF',
    },
    captureHint: {
      ...typography.bodyMedium,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
    },
    previewScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    previewContent: {
      flex: 1,
    },
    buttonPressed: {
      opacity: 0.9,
    },
  });
}
