import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanHeader } from '@/navigation/components/scan-header';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { createStyles } from '../scan-screen.styles';
import type { CameraPermissionStatus } from '../scan-types';
import { CameraStatusOverlay } from './camera-status-overlay';
import { CaptureFooter } from './capture-footer';

type CaptureModeViewProps = {
  cameraPermissionStatus: CameraPermissionStatus;
  hasCameraPermission: boolean;
  isCameraReady: boolean;
  isCapturing: boolean;
  isFlashEnabled: boolean;
  isRetryingCamera: boolean;
  isWorking: boolean;
  message: string | null;
  hasCameraDevice: boolean;
  shouldShowCameraOverlay: boolean;
  onBackPress: () => void;
  onCapture: () => void;
  onOpenGallery: () => void;
  onOpenSettings: () => void;
  onRetryCamera: () => void;
  onSwitchCamera: () => void;
  onToggleFlash: () => void;
};

export const CaptureModeView = memo(function CaptureModeViewComponent({
  cameraPermissionStatus,
  hasCameraPermission,
  isCameraReady,
  isCapturing,
  isFlashEnabled,
  isRetryingCamera,
  isWorking,
  message,
  hasCameraDevice,
  shouldShowCameraOverlay,
  onBackPress,
  onCapture,
  onOpenGallery,
  onOpenSettings,
  onRetryCamera,
  onSwitchCamera,
  onToggleFlash,
}: CaptureModeViewProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top, insets.bottom), [insets.bottom, insets.top, theme]);

  return (
    <>
      <View style={styles.content}>
        <ScanHeader
          isFlashEnabled={isFlashEnabled}
          isWorking={isWorking}
          mode='capture'
          onBackPress={onBackPress}
          onCrop={undefined}
          onEdit={undefined}
          onOpenGallery={onOpenGallery}
          onRotate={undefined}
          onSwitchCamera={onSwitchCamera}
          onToggleFlash={onToggleFlash}
        />

        <View style={styles.centerStage}>
          {shouldShowCameraOverlay ? (
            <CameraStatusOverlay
              canOpenSettings={cameraPermissionStatus === 'blocked'}
              errorMessage={
                !hasCameraPermission
                  ? cameraPermissionStatus === 'blocked'
                    ? 'Camera permission was denied previously. Open settings to continue.'
                    : 'Camera permission is required to scan receipts.'
                  : !hasCameraDevice
                    ? 'No camera device is available right now.'
                    : 'Preparing camera...'
              }
              isLoading={isRetryingCamera || (hasCameraPermission && hasCameraDevice && !isCameraReady)}
              onOpenSettings={onOpenSettings}
              onRetry={onRetryCamera}
            />
          ) : null}
        </View>

        <CaptureFooter
          isBusy={isCapturing}
          message={message}
          onCapture={onCapture}
        />
      </View>
    </>
  );
});
