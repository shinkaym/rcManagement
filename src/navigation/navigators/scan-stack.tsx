import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { ScanScreen } from '@/screens/scan/scan-screen';
import { ReceiptPreviewScreen } from '@/screens/scan/receipt-preview-screen';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

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
  return (
    <ScanScreen
      onBackToHome={() => navigation.getParent()?.navigate(ROOT_ROUTES.APP_DRAWER)}
      onSendImage={() => navigation.navigate(SCAN_ROUTES.PREVIEW_SCAN)}
    />
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
    previewScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    previewContent: {
      flex: 1,
    },
  });
}
