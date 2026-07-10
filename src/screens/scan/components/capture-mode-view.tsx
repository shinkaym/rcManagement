import { memo, useMemo, type MutableRefObject } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, usePhotoOutput, type CameraRef } from 'react-native-vision-camera';

import { ScanHeader } from '@/navigation/components/scan-header';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { createStyles } from '../scan-screen.styles';
import type { CameraPermissionStatus } from '../scan-types';
import { CameraBackdrop } from './camera-backdrop';
import { CameraStatusOverlay } from './camera-status-overlay';
import { CaptureFooter } from './capture-footer';

type CaptureModeViewProps = {
  cameraPermissionStatus: CameraPermissionStatus;
  cameraRef: MutableRefObject<CameraRef | null>;
  currentZoomLevel: number;
  device: ReturnType<typeof useCameraDevice>;
  hasCameraPermission: boolean;
  isCameraReady: boolean;
  isCapturing: boolean;
  isFlashEnabled: boolean;
  isRetryingCamera: boolean;
  isWorking: boolean;
  maxZoomValue: number;
  message: string | null;
  minZoomValue: number;
  photoOutput: ReturnType<typeof usePhotoOutput>;
  shouldShowCameraOverlay: boolean;
  zoomLevel: number;
  onBackPress: () => void;
  onCameraError: () => void;
  onCapture: () => void;
  onOpenGallery: () => void;
  onOpenSettings: () => void;
  onPreviewStarted: () => void;
  onPreviewStopped: () => void;
  onRetryCamera: () => void;
  onSwitchCamera: () => void;
  onToggleFlash: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export const CaptureModeView = memo(function CaptureModeViewComponent({
  cameraPermissionStatus,
  cameraRef,
  currentZoomLevel,
  device,
  hasCameraPermission,
  isCameraReady,
  isCapturing,
  isFlashEnabled,
  isRetryingCamera,
  isWorking,
  maxZoomValue,
  message,
  minZoomValue,
  photoOutput,
  shouldShowCameraOverlay,
  zoomLevel,
  onBackPress,
  onCameraError,
  onCapture,
  onOpenGallery,
  onOpenSettings,
  onPreviewStarted,
  onPreviewStopped,
  onRetryCamera,
  onSwitchCamera,
  onToggleFlash,
  onZoomIn,
  onZoomOut,
}: CaptureModeViewProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top, insets.bottom), [insets.bottom, insets.top, theme]);

  return (
    <>
      {hasCameraPermission && device ? (
        <Camera
          ref={cameraRef}
          style={styles.cameraPreview}
          device={device}
          implementationMode='compatible'
          isActive
          outputs={[photoOutput]}
          resizeMode='cover'
          torchMode={isFlashEnabled && device.hasTorch ? 'on' : 'off'}
          zoom={zoomLevel}
          onError={onCameraError}
          onPreviewStarted={onPreviewStarted}
          onPreviewStopped={onPreviewStopped}
        />
      ) : (
        <CameraBackdrop />
      )}

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
                  : !device
                    ? 'No camera device is available right now.'
                    : 'Preparing camera...'
              }
              isLoading={isRetryingCamera || (hasCameraPermission && !!device && !isCameraReady)}
              onOpenSettings={onOpenSettings}
              onRetry={onRetryCamera}
            />
          ) : null}
        </View>

        <CaptureFooter
          currentZoomLevel={currentZoomLevel}
          isBusy={isCapturing}
          maxZoomValue={maxZoomValue}
          message={message}
          minZoomValue={minZoomValue}
          onCapture={onCapture}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      </View>
    </>
  );
});
