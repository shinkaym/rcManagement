import {
  Cancel01Icon,
  Download01Icon,
  MailSend02Icon,
  MinusSignIcon,
  PlusSignIcon,
  RotateCcwSquareIcon,
} from '@hugeicons/core-free-icons';
import { AppIcon } from '@/shared/ui/icon';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { launchImageLibrary } from 'react-native-image-picker';
import PhotoManipulator, { MimeType, RotationMode } from 'react-native-photo-manipulator';
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Camera, useCameraDevice, usePhotoOutput, type CameraRef } from 'react-native-vision-camera';
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { ScanHeader } from '@/navigation/components/scan-header';
import { staticColors } from '@/shared/theme/tokens/colors';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';
import { AppTheme } from '@/shared/theme';

const minZoomLevel = 1;
const maxZoomLevel = 3;
const zoomStep = 0.25;
const minCropSize = 88;

type ScreenMode = 'capture' | 'crop' | 'preview';

type PreviewImageState = {
  height: number;
  uri: string;
  width: number;
};

type StageLayout = {
  height: number;
  width: number;
};

type CropRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type ImageFrame = CropRect;

type CropHandlePosition = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
type CropEdgePosition = 'bottom' | 'left' | 'right' | 'top';

type ScanScreenProps = {
  onBackToHome?: () => void;
  onSendImage?: () => void;
};

type CameraPermissionStatus = 'blocked' | 'checking' | 'denied' | 'granted';
type MediaPermissionKind = 'read' | 'save';

export function ScanScreen({ onBackToHome, onSendImage }: ScanScreenProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);
  const cameraRef = useRef<CameraRef | null>(null);
  const photoOutput = usePhotoOutput();
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [cropDraftImage, setCropDraftImage] = useState<PreviewImageState | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isRetryingCamera, setIsRetryingCamera] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [mode, setMode] = useState<ScreenMode>('capture');
  const [previewImage, setPreviewImage] = useState<PreviewImageState | null>(null);
  const [stageLayout, setStageLayout] = useState<StageLayout>({ width: 0, height: 0 });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<CameraPermissionStatus>('checking');
  const device = useCameraDevice(cameraFacing);
  const hasCameraPermission = cameraPermissionStatus === 'granted';

  const minAvailableZoom = Math.max(minZoomLevel, device?.minZoom ?? minZoomLevel);
  const maxAvailableZoom = Math.max(minAvailableZoom, Math.min(maxZoomLevel, device?.maxZoom ?? maxZoomLevel));
  const shouldShowCameraOverlay =
    mode === 'capture' && (!hasCameraPermission || !device || !isCameraReady || isRetryingCamera);
  const activeImage = mode === 'crop' ? cropDraftImage : previewImage;
  const imageFrame = activeImage ? getContainedFrame(stageLayout, activeImage) : null;

  const requestCameraAccess = useCallback(async () => {
    const permission = getCameraPermission();

    if (!permission) {
      setCameraPermissionStatus('granted');
      return 'granted' as const;
    }

    const currentStatus = await check(permission);

    if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
      setCameraPermissionStatus('granted');
      return 'granted' as const;
    }

    if (currentStatus === RESULTS.BLOCKED) {
      setCameraPermissionStatus('blocked');
      return 'blocked' as const;
    }

    const requestedStatus = await request(permission);

    if (requestedStatus === RESULTS.GRANTED || requestedStatus === RESULTS.LIMITED) {
      setCameraPermissionStatus('granted');
      return 'granted' as const;
    }

    if (requestedStatus === RESULTS.BLOCKED) {
      setCameraPermissionStatus('blocked');
      return 'blocked' as const;
    }

    setCameraPermissionStatus('denied');
    return 'denied' as const;
  }, []);

  useEffect(() => {
    requestCameraAccess().catch(() => {
      setStatusMessage('Unable to request camera permission right now.');
    });
  }, [requestCameraAccess]);

  useEffect(() => {
    if (!statusMessage) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setStatusMessage((currentValue) => (currentValue === statusMessage ? null : currentValue));
    }, 2600);

    return () => clearTimeout(timeoutId);
  }, [statusMessage]);

  useEffect(() => {
    if (mode !== 'crop' || !imageFrame || cropRect) {
      return;
    }

    setCropRect(createDefaultCropRect(imageFrame));
  }, [cropRect, imageFrame, mode]);

  useEffect(() => {
    setZoomLevel((currentValue) => clamp(currentValue, minAvailableZoom, maxAvailableZoom));
  }, [maxAvailableZoom, minAvailableZoom]);

  function showMessage(message: string) {
    setStatusMessage(message);
  }

  function handleBackToHome() {
    onBackToHome?.();
  }

  function handleHeaderBackPress() {
    if (mode === 'capture') {
      handleBackToHome();
      return;
    }

    handleClosePreview();
  }

  function handleClosePreview() {
    setCropRect(null);
    setCropDraftImage(null);
    setIsCameraReady(false);
    setMode('capture');
    setPreviewImage(null);
    setStatusMessage(null);
  }

  function handleToggleFlash() {
    setIsFlashEnabled((currentValue) => !currentValue);
  }

  function handleSwitchCamera() {
    setIsCameraReady(false);
    setCameraFacing((currentValue) => (currentValue === 'back' ? 'front' : 'back'));
  }

  function handleZoomStep(direction: 'in' | 'out') {
    setZoomLevel((currentValue) => {
      const nextValue = direction === 'in' ? currentValue + zoomStep : currentValue - zoomStep;

      return clamp(Number(nextValue.toFixed(2)), minAvailableZoom, maxAvailableZoom);
    });
  }

  function handleStageLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setStageLayout((currentValue) => {
      if (currentValue.width === width && currentValue.height === height) {
        return currentValue;
      }

      return { width, height };
    });
  }

  async function handleOpenGallery() {
    if (isWorking) {
      return;
    }

    try {
      const permissionStatus = await requestMediaPermission('read');

      if (permissionStatus !== 'granted') {
        showMessage(
          permissionStatus === 'blocked'
            ? 'Photo library permission was denied. Open settings to continue.'
            : 'Photo library permission is required to pick receipt images.',
        );
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets?.[0]) {
        return;
      }

      const selectedAsset = result.assets[0];
      const selectedUri = ensureFileUri(selectedAsset.originalPath) ?? ensureFileUri(selectedAsset.uri);

      if (!selectedUri) {
        showMessage('Unable to open the selected image right now.');
        return;
      }

      setCropRect(null);
      setCropDraftImage(null);
      setMode('preview');
      setPreviewImage(
        await createPreviewImageState(selectedUri, {
          width: selectedAsset.width ?? stageLayout.width ?? 1,
          height: selectedAsset.height ?? stageLayout.height ?? 1,
        }),
      );
    } catch {
      showMessage('Unable to open the photo library right now.');
    }
  }

  async function handleCaptureImage() {
    if (!device || !isCameraReady || isCapturing || isWorking) {
      return;
    }

    setIsCapturing(true);

    try {
      const capturedPhoto = await photoOutput.capturePhotoToFile(
        {
          enableShutterSound: false,
          flashMode: isFlashEnabled && device.hasFlash ? 'on' : 'off',
        },
        {},
      );
      const capturedUri = ensureFileUri(capturedPhoto.filePath);

      if (!capturedUri) {
        showMessage('Unable to capture image right now.');
        return;
      }

      setCropRect(null);
      setCropDraftImage(null);
      setMode('preview');
      setPreviewImage(await createPreviewImageState(capturedUri));
    } catch {
      showMessage('Unable to capture image right now.');
    } finally {
      setIsCapturing(false);
    }
  }

  async function handleRetryCamera() {
    setIsRetryingCamera(true);

    try {
      await requestCameraAccess();
      setIsCameraReady(false);
    } catch {
      showMessage('Unable to request camera permission right now.');
    } finally {
      setIsRetryingCamera(false);
    }
  }

  function handleEnterCropMode() {
    if (!previewImage) {
      return;
    }

    setCropDraftImage(previewImage);
    setCropRect(null);
    setMode('crop');
  }

  async function transformImage(
    sourceImage: PreviewImageState | null,
    onApplyImage: (image: PreviewImageState) => void,
    transform: (uri: string) => Promise<PreviewImageState>,
  ) {
    if (!sourceImage || isWorking) {
      return;
    }

    setIsWorking(true);

    try {
      const nextImage = await transform(sourceImage.uri);
      onApplyImage(nextImage);
    } catch {
      showMessage('Unable to update the image right now.');
    } finally {
      setIsWorking(false);
    }
  }

  async function handleRotatePreviewImage() {
    const nextMode = mode === 'crop' ? 'crop' : 'preview';
    const sourceImage = nextMode === 'crop' ? cropDraftImage : previewImage;

    await transformImage(
      sourceImage,
      (nextImage) => {
        if (nextMode === 'crop') {
          setCropDraftImage(nextImage);
        } else {
          setPreviewImage(nextImage);
        }
      },
      async (imageUri) => {
        const rotatedUri = await PhotoManipulator.rotateImage(imageUri, RotationMode.R90, MimeType.JPEG);
        return createPreviewImageState(ensureFileUri(rotatedUri) ?? rotatedUri);
      },
    );

    if (nextMode === 'crop') {
      setCropRect(null);
    }

    setMode(nextMode);
  }

  async function handleSaveCrop() {
    if (!cropDraftImage || !cropRect || !imageFrame) {
      return;
    }

    const cropInPixels = mapCropRectToImagePixels(cropRect, imageFrame, cropDraftImage);

    setIsWorking(true);

    try {
      const croppedUri = await PhotoManipulator.crop(cropDraftImage.uri, cropInPixels, undefined, MimeType.JPEG);
      setPreviewImage(await createPreviewImageState(ensureFileUri(croppedUri) ?? croppedUri));
      setCropDraftImage(null);
      setCropRect(null);
      setMode('preview');
    } catch {
      showMessage('Unable to crop the image right now.');
    } finally {
      setIsWorking(false);
    }
  }

  function handleCancelCrop() {
    setCropDraftImage(null);
    setCropRect(null);
    setMode('preview');
  }

  function handlePreviewPlaceholderAction() {
    showMessage('This edit tool is queued for the next step.');
  }

  async function handleDownloadImage() {
    if (!previewImage || isWorking) {
      return;
    }

    setIsWorking(true);

    try {
      const permissionStatus = await requestMediaPermission('save');

      if (permissionStatus !== 'granted') {
        showMessage(
          permissionStatus === 'blocked'
            ? 'Photo library permission was denied. Open settings to continue.'
            : 'Photo library permission is required to download receipt images.',
        );
        return;
      }

      await CameraRoll.save(previewImage.uri, { type: 'photo' });
      showMessage('Image saved to your photo library.');
    } catch {
      showMessage('Unable to save the image right now.');
    } finally {
      setIsWorking(false);
    }
  }

  function handleSendImage() {
    onSendImage?.();
  }

  async function requestMediaPermission(kind: MediaPermissionKind) {
    const permission = getMediaPermission(kind);

    if (!permission) {
      return 'granted' as const;
    }

    const currentStatus = await check(permission);
    if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
      return 'granted' as const;
    }

    if (currentStatus === RESULTS.BLOCKED) {
      return 'blocked' as const;
    }

    const requestedStatus = await request(permission);

    if (requestedStatus === RESULTS.GRANTED || requestedStatus === RESULTS.LIMITED) {
      return 'granted' as const;
    }

    if (requestedStatus === RESULTS.BLOCKED) {
      return 'blocked' as const;
    }

    return 'denied' as const;
  }

  function getCameraPermission() {
    if (Platform.OS === 'ios') {
      return PERMISSIONS.IOS.CAMERA;
    }

    if (Platform.OS === 'android') {
      return PERMISSIONS.ANDROID.CAMERA;
    }

    return null;
  }

  function getMediaPermission(kind: MediaPermissionKind) {
    if (Platform.OS === 'ios') {
      return kind === 'read' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
    }

    if (Platform.OS === 'android') {
      const androidApiLevel = Number(Platform.Version);

      if (kind === 'read') {
        return androidApiLevel >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }

      return androidApiLevel >= 29 ? null : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
    }

    return null;
  }

  return (
    <>
      <StatusBar barStyle='light-content' />
      <View style={styles.screen}>
        {mode === 'capture' && hasCameraPermission && device ? (
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
            onError={() => showMessage('Unable to start camera right now.')}
            onPreviewStarted={() => setIsCameraReady(true)}
            onPreviewStopped={() => setIsCameraReady(false)}
          />
        ) : (
          <View style={styles.previewBackdrop}>
            <View style={styles.previewGlowTop} />
            <View style={styles.previewGlowBottom} />
          </View>
        )}

        <View style={styles.content}>
          {mode !== 'crop' ? (
            <ScanHeader
              isFlashEnabled={isFlashEnabled}
              isWorking={isWorking}
              mode={mode}
              onBackPress={handleHeaderBackPress}
              onCrop={handleEnterCropMode}
              onEdit={handlePreviewPlaceholderAction}
              onOpenGallery={handleOpenGallery}
              onRotate={handleRotatePreviewImage}
              onSwitchCamera={handleSwitchCamera}
              onToggleFlash={handleToggleFlash}
            />
          ) : null}

          <View style={styles.centerStage} onLayout={handleStageLayout}>
            {activeImage ? (
              <Image source={{ uri: activeImage.uri }} style={styles.previewImage} resizeMode='contain' />
            ) : null}

            {mode === 'crop' && imageFrame && cropRect ? (
              <CropOverlay imageFrame={imageFrame} cropRect={cropRect} onChangeRect={setCropRect} />
            ) : null}

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
                onOpenSettings={() => {
                  openSettings('application').catch(() => {
                    showMessage('Unable to open settings right now.');
                  });
                }}
                onRetry={handleRetryCamera}
              />
            ) : null}
          </View>

          {mode === 'capture' ? (
            <CaptureFooter
              currentZoomLevel={zoomLevel}
              isBusy={isCapturing}
              maxZoomValue={maxAvailableZoom}
              message={statusMessage}
              minZoomValue={minAvailableZoom}
              onCapture={handleCaptureImage}
              onZoomIn={() => handleZoomStep('in')}
              onZoomOut={() => handleZoomStep('out')}
            />
          ) : null}

          {mode === 'preview' ? (
            <PreviewFooter
              isWorking={isWorking}
              message={statusMessage}
              onDownload={handleDownloadImage}
              onSend={handleSendImage}
            />
          ) : null}

          {mode === 'crop' ? (
            <CropFooter
              isWorking={isWorking}
              message={statusMessage}
              onCancel={handleCancelCrop}
              onDone={handleSaveCrop}
              onRotate={handleRotatePreviewImage}
            />
          ) : null}
        </View>
      </View>
    </>
  );
}

async function createPreviewImageState(
  uri: string,
  fallbackSize?: Partial<Pick<PreviewImageState, 'height' | 'width'>>,
): Promise<PreviewImageState> {
  const normalizedUri = ensureFileUri(uri) ?? uri;
  const resolvedSize =
    fallbackSize?.width && fallbackSize?.height
      ? { width: fallbackSize.width, height: fallbackSize.height }
      : await getImageSize(normalizedUri);

  return {
    uri: normalizedUri,
    width: resolvedSize.width,
    height: resolvedSize.height,
  };
}

function getImageSize(uri: string): Promise<Pick<PreviewImageState, 'height' | 'width'>> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      reject,
    );
  });
}

function ensureFileUri(uri?: string) {
  if (!uri) {
    return null;
  }

  if (/^[a-z][a-z0-9+\-.]*:\/\//i.test(uri)) {
    return uri;
  }

  return `file://${uri}`;
}

type CameraStatusOverlayProps = {
  canOpenSettings: boolean;
  errorMessage: string;
  isLoading: boolean;
  onOpenSettings: () => void;
  onRetry: () => void;
};

function CameraStatusOverlay({
  canOpenSettings,
  errorMessage,
  isLoading,
  onOpenSettings,
  onRetry,
}: CameraStatusOverlayProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.cameraStatusOverlay}>
      {isLoading ? <ActivityIndicator color={staticColors.white} size='small' /> : null}
      <Text style={styles.cameraStatusText}>{errorMessage}</Text>
      <View style={styles.cameraStatusActions}>
        {!isLoading ? <PillActionButton label='Retry' onPress={onRetry} /> : null}
        {canOpenSettings ? <PillActionButton label='Open settings' onPress={onOpenSettings} outlined /> : null}
      </View>
    </View>
  );
}

type PillActionButtonProps = {
  label: string;
  onPress: () => void;
  outlined?: boolean;
};

function PillActionButton({ label, onPress, outlined = false }: PillActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable onPress={onPress} style={styles.pillActionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.pillActionButton,
            outlined ? styles.pillActionButtonOutlined : styles.pillActionButtonFilled,
            pressed ? styles.controlPressed : null,
          ]}
        >
          <Text
            style={[styles.pillActionLabel, outlined ? styles.pillActionLabelOutlined : styles.pillActionLabelFilled]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

type CaptureFooterProps = {
  currentZoomLevel: number;
  isBusy: boolean;
  maxZoomValue: number;
  message: string | null;
  minZoomValue: number;
  onCapture: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function CaptureFooter({
  currentZoomLevel,
  isBusy,
  maxZoomValue,
  message,
  minZoomValue,
  onCapture,
  onZoomIn,
  onZoomOut,
}: CaptureFooterProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.bottomSection}>
      {message ? (
        <View style={styles.statusMessagePill}>
          <Text style={styles.statusMessageText}>{message}</Text>
        </View>
      ) : null}

      <ZoomControl
        currentZoomLevel={currentZoomLevel}
        maxZoomValue={maxZoomValue}
        minZoomValue={minZoomValue}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />

      <CaptureButton isBusy={isBusy} onPress={onCapture} />
    </View>
  );
}

type PreviewFooterProps = {
  isWorking: boolean;
  message: string | null;
  onDownload: () => void;
  onSend: () => void;
};

function PreviewFooter({ isWorking, message, onDownload, onSend }: PreviewFooterProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.previewFooter}>
      {message ? (
        <View style={styles.statusMessagePill}>
          <Text style={styles.statusMessageText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.previewActionsRow}>
        <TextActionButton disabled={isWorking} icon={Download01Icon} label='Download' onPress={onDownload} />

        <SendActionButton disabled={isWorking} onPress={onSend} />
      </View>
    </View>
  );
}

type CropFooterProps = {
  isWorking: boolean;
  message: string | null;
  onCancel: () => void;
  onDone: () => void;
  onRotate: () => void;
};

function CropFooter({ isWorking, message, onCancel, onDone, onRotate }: CropFooterProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.cropFooter}>
      {message ? (
        <View style={styles.statusMessagePill}>
          <Text style={styles.statusMessageText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.cropToolbar}>
        <ToolbarIconButton disabled={isWorking} icon={Cancel01Icon} onPress={onCancel} />
        <ToolbarIconButton disabled={isWorking} icon={RotateCcwSquareIcon} onPress={onRotate} />
        <CropDoneButton disabled={isWorking} onPress={onDone} />
      </View>
    </View>
  );
}

type ZoomControlProps = {
  currentZoomLevel: number;
  maxZoomValue: number;
  minZoomValue: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function ZoomControl({ currentZoomLevel, maxZoomValue, minZoomValue, onZoomIn, onZoomOut }: ZoomControlProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);
  const trackWidth = 220;
  const thumbSize = 18;
  const zoomRange = maxZoomValue - minZoomValue;
  const progress = zoomRange <= 0 ? 0 : (currentZoomLevel - minZoomValue) / zoomRange;
  const thumbLeft = progress * (trackWidth - thumbSize);

  return (
    <View style={styles.zoomControl}>
      <View style={styles.zoomControlRow}>
        <Pressable onPress={onZoomOut} style={styles.zoomStepPressable}>
          {({ pressed }) => (
            <View style={[styles.zoomStepButton, pressed ? styles.controlPressed : null]}>
              <AppIcon icon={MinusSignIcon} size={18} color={staticColors.white} strokeWidth={2.1} />
            </View>
          )}
        </Pressable>

        <View style={styles.zoomTrackWrapper}>
          <View style={styles.zoomTrack}>
            <View style={styles.zoomTrackFill} />
            <View style={[styles.zoomThumb, { left: thumbLeft }]} />
          </View>
        </View>

        <Pressable onPress={onZoomIn} style={styles.zoomStepPressable}>
          {({ pressed }) => (
            <View style={[styles.zoomStepButton, pressed ? styles.controlPressed : null]}>
              <AppIcon icon={PlusSignIcon} size={18} color={staticColors.white} strokeWidth={2.1} />
            </View>
          )}
        </Pressable>
      </View>

      <Text style={styles.zoomValueLabel}>{currentZoomLevel.toFixed(2)}x</Text>
    </View>
  );
}

type CaptureButtonProps = {
  isBusy: boolean;
  onPress: () => void;
};

function CaptureButton({ isBusy, onPress }: CaptureButtonProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <Pressable disabled={isBusy} onPress={onPress} style={styles.capturePressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.captureShell,
            isBusy ? styles.captureButtonBusy : null,
            pressed ? styles.captureButtonPressed : null,
          ]}
        >
          <View style={[styles.captureOuterRing, isBusy ? styles.captureOuterRingBusy : null]}>
            <View style={[styles.captureMiddleRing, isBusy ? styles.captureMiddleRingBusy : null]}>
              <View style={[styles.captureCore, isBusy ? styles.captureCoreBusy : null]} />
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

type TextActionButtonProps = {
  disabled?: boolean;
  icon: typeof Download01Icon;
  label: string;
  onPress: () => void;
};

function TextActionButton({ disabled = false, icon, label, onPress }: TextActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.textActionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.textActionButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}
        >
          <AppIcon icon={icon} size={20} color={staticColors.white} strokeWidth={2} />
          <Text style={styles.textActionLabel}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

type SendActionButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

function SendActionButton({ disabled = false, onPress }: SendActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.sendActionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.sendActionButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}
        >
          <AppIcon icon={MailSend02Icon} size={30} color='#1D8BFF' strokeWidth={1.8} />
        </View>
      )}
    </Pressable>
  );
}

type ToolbarIconButtonProps = {
  disabled?: boolean;
  icon: typeof Cancel01Icon;
  onPress: () => void;
};

function ToolbarIconButton({ disabled = false, icon, onPress }: ToolbarIconButtonProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.cropToolbarButtonPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.cropToolbarButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}
        >
          <AppIcon icon={icon} size={28} color={staticColors.white} strokeWidth={1.85} />
        </View>
      )}
    </Pressable>
  );
}

type CropDoneButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

function CropDoneButton({ disabled = false, onPress }: CropDoneButtonProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.cropDonePressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.cropDoneButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}
        >
          <Text style={styles.cropDoneLabel}>Done</Text>
        </View>
      )}
    </Pressable>
  );
}

type CropOverlayProps = {
  cropRect: CropRect;
  imageFrame: ImageFrame;
  onChangeRect: (rect: CropRect) => void;
};

function CropOverlay({ cropRect, imageFrame, onChangeRect }: CropOverlayProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);
  const dragStartRef = useRef<TouchGestureState | null>(null);
  const topLeftStartRef = useRef<TouchGestureState | null>(null);
  const topRightStartRef = useRef<TouchGestureState | null>(null);
  const bottomLeftStartRef = useRef<TouchGestureState | null>(null);
  const bottomRightStartRef = useRef<TouchGestureState | null>(null);

  const moveResponder = createTouchResponder(dragStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    moveCropRect(startRect, imageFrame, dx, dy),
  );
  const topLeftResponder = createTouchResponder(topLeftStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'topLeft'),
  );
  const topRightResponder = createTouchResponder(topRightStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'topRight'),
  );
  const bottomLeftResponder = createTouchResponder(bottomLeftStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'bottomLeft'),
  );
  const bottomRightResponder = createTouchResponder(bottomRightStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'bottomRight'),
  );
  const topEdgeStartRef = useRef<TouchGestureState | null>(null);
  const rightEdgeStartRef = useRef<TouchGestureState | null>(null);
  const bottomEdgeStartRef = useRef<TouchGestureState | null>(null);
  const leftEdgeStartRef = useRef<TouchGestureState | null>(null);
  const topEdgeResponder = createTouchResponder(topEdgeStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'top'),
  );
  const rightEdgeResponder = createTouchResponder(rightEdgeStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'right'),
  );
  const bottomEdgeResponder = createTouchResponder(bottomEdgeStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'bottom'),
  );
  const leftEdgeResponder = createTouchResponder(leftEdgeStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'left'),
  );

  return (
    <View pointerEvents='box-none' style={StyleSheet.absoluteFill}>
      <View
        pointerEvents='none'
        style={[
          styles.cropShade,
          {
            top: imageFrame.y,
            left: imageFrame.x,
            width: imageFrame.width,
            height: Math.max(cropRect.y - imageFrame.y, 0),
          },
        ]}
      />
      <View
        pointerEvents='none'
        style={[
          styles.cropShade,
          {
            top: cropRect.y,
            left: imageFrame.x,
            width: Math.max(cropRect.x - imageFrame.x, 0),
            height: cropRect.height,
          },
        ]}
      />
      <View
        pointerEvents='none'
        style={[
          styles.cropShade,
          {
            top: cropRect.y,
            left: cropRect.x + cropRect.width,
            width: Math.max(imageFrame.x + imageFrame.width - (cropRect.x + cropRect.width), 0),
            height: cropRect.height,
          },
        ]}
      />
      <View
        pointerEvents='none'
        style={[
          styles.cropShade,
          {
            top: cropRect.y + cropRect.height,
            left: imageFrame.x,
            width: imageFrame.width,
            height: Math.max(imageFrame.y + imageFrame.height - (cropRect.y + cropRect.height), 0),
          },
        ]}
      />

      <View
        style={[
          styles.cropRect,
          {
            left: cropRect.x,
            top: cropRect.y,
            width: cropRect.width,
            height: cropRect.height,
          },
        ]}
      >
        <View style={styles.cropRectBorder} />
        <View pointerEvents='none' style={styles.cropGridVerticalLeft} />
        <View pointerEvents='none' style={styles.cropGridVerticalRight} />
        <View pointerEvents='none' style={styles.cropGridHorizontalTop} />
        <View pointerEvents='none' style={styles.cropGridHorizontalBottom} />
        <View style={styles.cropMoveSurface} {...moveResponder} />
        <CropEdge position='top' responderProps={topEdgeResponder} />
        <CropEdge position='right' responderProps={rightEdgeResponder} />
        <CropEdge position='bottom' responderProps={bottomEdgeResponder} />
        <CropEdge position='left' responderProps={leftEdgeResponder} />

        <CropHandle position='topLeft' responderProps={topLeftResponder} />
        <CropHandle position='topRight' responderProps={topRightResponder} />
        <CropHandle position='bottomLeft' responderProps={bottomLeftResponder} />
        <CropHandle position='bottomRight' responderProps={bottomRightResponder} />
      </View>
    </View>
  );
}

type CropHandleProps = {
  position: CropHandlePosition;
  responderProps: ViewResponderProps;
};

function CropHandle({ position, responderProps }: CropHandleProps) {
  const styles = createStyles(useAppTheme(), 0, 0);
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('Left');

  return (
    <View
      style={[
        styles.cropHandleTouchArea,
        isTop ? styles.cropHandleTop : styles.cropHandleBottom,
        isLeft ? styles.cropHandleLeft : styles.cropHandleRight,
      ]}
      {...responderProps}
    >
      <View
        style={[
          styles.cropHandleHorizontal,
          isLeft ? styles.cropHandleHorizontalLeft : styles.cropHandleHorizontalRight,
          isTop ? styles.cropHandleHorizontalTop : styles.cropHandleHorizontalBottom,
        ]}
      />
      <View
        style={[
          styles.cropHandleVertical,
          isLeft ? styles.cropHandleVerticalLeft : styles.cropHandleVerticalRight,
          isTop ? styles.cropHandleVerticalTop : styles.cropHandleVerticalBottom,
        ]}
      />
    </View>
  );
}

type CropEdgeProps = {
  position: CropEdgePosition;
  responderProps: ViewResponderProps;
};

function CropEdge({ position, responderProps }: CropEdgeProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <View
      style={[
        styles.cropEdgeTouchArea,
        position === 'top' ? styles.cropEdgeTop : null,
        position === 'right' ? styles.cropEdgeRight : null,
        position === 'bottom' ? styles.cropEdgeBottom : null,
        position === 'left' ? styles.cropEdgeLeft : null,
      ]}
      {...responderProps}
    />
  );
}

type TouchGestureState = {
  pageX: number;
  pageY: number;
  rect: CropRect;
};

type ViewResponderProps = Pick<
  ViewProps,
  | 'onMoveShouldSetResponder'
  | 'onResponderGrant'
  | 'onResponderMove'
  | 'onResponderRelease'
  | 'onResponderTerminate'
  | 'onStartShouldSetResponder'
>;

function createTouchResponder(
  startRef: MutableRefObject<TouchGestureState | null>,
  cropRect: CropRect,
  onChangeRect: (rect: CropRect) => void,
  transformRect: (startRect: CropRect, dx: number, dy: number) => CropRect,
): ViewResponderProps {
  function beginGesture(event: GestureResponderEvent) {
    startRef.current = {
      pageX: event.nativeEvent.pageX,
      pageY: event.nativeEvent.pageY,
      rect: cropRect,
    };
  }

  function moveGesture(event: GestureResponderEvent) {
    const startState = startRef.current;

    if (!startState) {
      return;
    }

    const dx = event.nativeEvent.pageX - startState.pageX;
    const dy = event.nativeEvent.pageY - startState.pageY;
    onChangeRect(transformRect(startState.rect, dx, dy));
  }

  function endGesture() {
    startRef.current = null;
  }

  return {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderGrant: beginGesture,
    onResponderMove: moveGesture,
    onResponderRelease: endGesture,
    onResponderTerminate: endGesture,
  };
}

function getContainedFrame(stageLayout: StageLayout, previewImage: PreviewImageState): ImageFrame | null {
  if (stageLayout.width <= 0 || stageLayout.height <= 0 || previewImage.width <= 0 || previewImage.height <= 0) {
    return null;
  }

  const scale = Math.min(stageLayout.width / previewImage.width, stageLayout.height / previewImage.height);
  const width = previewImage.width * scale;
  const height = previewImage.height * scale;

  return {
    x: (stageLayout.width - width) / 2,
    y: (stageLayout.height - height) / 2,
    width,
    height,
  };
}

function createDefaultCropRect(imageFrame: ImageFrame): CropRect {
  return {
    x: imageFrame.x,
    y: imageFrame.y,
    width: imageFrame.width,
    height: imageFrame.height,
  };
}

function moveCropRect(cropRect: CropRect, imageFrame: ImageFrame, dx: number, dy: number): CropRect {
  const nextX = clamp(cropRect.x + dx, imageFrame.x, imageFrame.x + imageFrame.width - cropRect.width);
  const nextY = clamp(cropRect.y + dy, imageFrame.y, imageFrame.y + imageFrame.height - cropRect.height);

  return {
    ...cropRect,
    x: nextX,
    y: nextY,
  };
}

function resizeCropRect(
  cropRect: CropRect,
  imageFrame: ImageFrame,
  dx: number,
  dy: number,
  position: CropHandlePosition | CropEdgePosition,
): CropRect {
  const rightEdge = cropRect.x + cropRect.width;
  const bottomEdge = cropRect.y + cropRect.height;
  const minWidth = Math.min(minCropSize, imageFrame.width);
  const minHeight = Math.min(minCropSize, imageFrame.height);

  if (position === 'topLeft') {
    const nextX = clamp(cropRect.x + dx, imageFrame.x, rightEdge - minWidth);
    const nextY = clamp(cropRect.y + dy, imageFrame.y, bottomEdge - minHeight);

    return {
      x: nextX,
      y: nextY,
      width: rightEdge - nextX,
      height: bottomEdge - nextY,
    };
  }

  if (position === 'topRight') {
    const nextRight = clamp(rightEdge + dx, cropRect.x + minWidth, imageFrame.x + imageFrame.width);
    const nextY = clamp(cropRect.y + dy, imageFrame.y, bottomEdge - minHeight);

    return {
      x: cropRect.x,
      y: nextY,
      width: nextRight - cropRect.x,
      height: bottomEdge - nextY,
    };
  }

  if (position === 'bottomLeft') {
    const nextX = clamp(cropRect.x + dx, imageFrame.x, rightEdge - minWidth);
    const nextBottom = clamp(bottomEdge + dy, cropRect.y + minHeight, imageFrame.y + imageFrame.height);

    return {
      x: nextX,
      y: cropRect.y,
      width: rightEdge - nextX,
      height: nextBottom - cropRect.y,
    };
  }

  if (position === 'top') {
    const nextY = clamp(cropRect.y + dy, imageFrame.y, bottomEdge - minHeight);

    return {
      x: cropRect.x,
      y: nextY,
      width: cropRect.width,
      height: bottomEdge - nextY,
    };
  }

  if (position === 'right') {
    const nextRight = clamp(rightEdge + dx, cropRect.x + minWidth, imageFrame.x + imageFrame.width);

    return {
      x: cropRect.x,
      y: cropRect.y,
      width: nextRight - cropRect.x,
      height: cropRect.height,
    };
  }

  if (position === 'bottom') {
    const nextBottom = clamp(bottomEdge + dy, cropRect.y + minHeight, imageFrame.y + imageFrame.height);

    return {
      x: cropRect.x,
      y: cropRect.y,
      width: cropRect.width,
      height: nextBottom - cropRect.y,
    };
  }

  if (position === 'left') {
    const nextX = clamp(cropRect.x + dx, imageFrame.x, rightEdge - minWidth);

    return {
      x: nextX,
      y: cropRect.y,
      width: rightEdge - nextX,
      height: cropRect.height,
    };
  }

  const nextRight = clamp(rightEdge + dx, cropRect.x + minWidth, imageFrame.x + imageFrame.width);
  const nextBottom = clamp(bottomEdge + dy, cropRect.y + minHeight, imageFrame.y + imageFrame.height);

  return {
    x: cropRect.x,
    y: cropRect.y,
    width: nextRight - cropRect.x,
    height: nextBottom - cropRect.y,
  };
}

function mapCropRectToImagePixels(cropRect: CropRect, imageFrame: ImageFrame, previewImage: PreviewImageState) {
  const scaleX = previewImage.width / imageFrame.width;
  const scaleY = previewImage.height / imageFrame.height;
  const x = Math.max(0, Math.round((cropRect.x - imageFrame.x) * scaleX));
  const y = Math.max(0, Math.round((cropRect.y - imageFrame.y) * scaleY));
  const width = Math.max(1, Math.round(cropRect.width * scaleX));
  const height = Math.max(1, Math.round(cropRect.height * scaleY));

  return {
    x,
    y,
    width: Math.min(width, previewImage.width - x),
    height: Math.min(height, previewImage.height - y),
  };
}

function clamp(value: number, minValue: number, maxValue: number) {
  return Math.min(Math.max(value, minValue), maxValue);
}

function createStyles(theme: AppTheme, topInset: number, bottomInset: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: staticColors.black,
    },
    cameraPreview: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    previewBackdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: '#050607',
    },
    previewGlowTop: {
      position: 'absolute',
      top: '10%',
      left: '-10%',
      width: 260,
      height: 260,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(245, 124, 0, 0.12)',
      transform: [{ rotate: '18deg' }],
    },
    previewGlowBottom: {
      position: 'absolute',
      right: '-18%',
      bottom: '12%',
      width: 300,
      height: 300,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      transform: [{ rotate: '-12deg' }],
    },
    content: {
      flex: 1,
      paddingTop: topInset > 0 ? topInset + spacing.sm : spacing.xl,
      paddingRight: spacing.lg,
      paddingBottom: bottomInset > 0 ? bottomInset + spacing.lg : spacing.xl,
      paddingLeft: spacing.lg,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48,
      zIndex: 3,
    },
    topControlsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
      boxShadow: theme.shadow.elevated,
    },
    surfaceButtonPressable: {
      borderRadius: radius.pill,
    },
    surfaceButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: theme.colors.surface,
      boxShadow: theme.shadow.button,
    },
    topControlPressable: {
      borderRadius: radius.md,
    },
    topControlButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: staticColors.transparent,
    },
    topControlButtonActive: {
      backgroundColor: 'rgba(245, 124, 0, 0.18)',
    },
    centerStage: {
      flex: 1,
      justifyContent: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
      overflow: 'hidden',
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    cameraStatusOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
    },
    cameraStatusText: {
      ...typography.bodyMedium,
      maxWidth: 360,
      color: staticColors.white,
      textAlign: 'center',
    },
    cameraStatusActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    pillActionPressable: {
      borderRadius: radius.lg,
    },
    pillActionButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
    },
    pillActionButtonFilled: {
      backgroundColor: theme.colors.primary,
    },
    pillActionButtonOutlined: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.28)',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    pillActionLabel: {
      ...typography.labelLarge,
      fontFamily: typography.titleMedium.fontFamily,
    },
    pillActionLabelFilled: {
      color: staticColors.white,
    },
    pillActionLabelOutlined: {
      color: staticColors.white,
    },
    bottomSection: {
      alignItems: 'center',
      gap: spacing.lg,
    },
    previewFooter: {
      gap: spacing.lg,
    },
    previewActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cropFooter: {
      gap: spacing.md,
    },
    cropToolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
    },
    statusMessagePill: {
      alignSelf: 'center',
      maxWidth: 360,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.82)',
    },
    statusMessageText: {
      ...typography.bodyMedium,
      color: staticColors.white,
      textAlign: 'center',
    },
    zoomControl: {
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
    },
    zoomControlRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    zoomStepPressable: {
      borderRadius: radius.pill,
    },
    zoomStepButton: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderCurve: 'continuous',
    },
    zoomTrackWrapper: {
      width: 220,
      marginHorizontal: spacing.xs,
      justifyContent: 'center',
    },
    zoomTrack: {
      width: '100%',
      height: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.42)',
      borderRadius: radius.pill,
      overflow: 'visible',
      justifyContent: 'center',
    },
    zoomTrackFill: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: staticColors.white,
      borderRadius: radius.pill,
      opacity: 0.35,
    },
    zoomThumb: {
      position: 'absolute',
      top: -8,
      width: 18,
      height: 18,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
    },
    zoomValueLabel: {
      ...typography.labelLarge,
      marginTop: spacing.xxs,
      color: 'rgba(255, 255, 255, 0.84)',
      textAlign: 'center',
    },
    capturePressable: {
      borderRadius: radius.pill,
    },
    captureShell: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureOuterRing: {
      width: 92,
      height: 92,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.72)',
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    captureOuterRingBusy: {
      borderColor: 'rgba(255, 255, 255, 0.52)',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    captureMiddleRing: {
      width: 80,
      height: 80,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: 'rgba(146, 146, 146, 0.72)',
      backgroundColor: 'rgba(255, 255, 255, 0.20)',
    },
    captureMiddleRingBusy: {
      borderColor: 'rgba(120, 120, 120, 0.84)',
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
    },
    captureCore: {
      width: 68,
      height: 68,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: staticColors.white,
    },
    captureButtonPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    captureButtonBusy: {
      opacity: 0.94,
      transform: [{ scale: 0.965 }],
    },
    captureCoreBusy: {
      backgroundColor: staticColors.grey,
    },
    textActionPressable: {
      borderRadius: radius.pill,
    },
    textActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.16)',
    },
    textActionLabel: {
      ...typography.titleMedium,
      color: staticColors.white,
    },
    sendActionPressable: {
      borderRadius: radius.pill,
    },
    sendActionButton: {
      width: 74,
      height: 74,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: staticColors.white,
      boxShadow: theme.shadow.floating,
    },
    cropToolbarButtonPressable: {
      borderRadius: radius.pill,
    },
    cropToolbarButton: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: staticColors.transparent,
    },
    cropDonePressable: {
      borderRadius: radius.pill,
    },
    cropDoneButton: {
      minWidth: 126,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: '#1396FF',
    },
    cropDoneLabel: {
      ...typography.titleMedium,
      color: staticColors.white,
    },
    cropShade: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.54)',
    },
    cropRect: {
      position: 'absolute',
    },
    cropRectBorder: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderWidth: 1.5,
      borderColor: staticColors.white,
    },
    cropGridVerticalLeft: {
      position: 'absolute',
      top: 1,
      bottom: 1,
      left: '33.333%',
      width: 1,
      marginLeft: -0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
    },
    cropGridVerticalRight: {
      position: 'absolute',
      top: 1,
      bottom: 1,
      left: '66.666%',
      width: 1,
      marginLeft: -0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
    },
    cropGridHorizontalTop: {
      position: 'absolute',
      top: '33.333%',
      right: 1,
      left: 1,
      height: 1,
      marginTop: -0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
    },
    cropGridHorizontalBottom: {
      position: 'absolute',
      top: '66.666%',
      right: 1,
      left: 1,
      height: 1,
      marginTop: -0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
    },
    cropMoveSurface: {
      position: 'absolute',
      top: 24,
      right: 24,
      bottom: 24,
      left: 24,
    },
    cropEdgeTouchArea: {
      position: 'absolute',
      zIndex: 1,
    },
    cropEdgeTop: {
      top: -10,
      right: 22,
      left: 22,
      height: 20,
    },
    cropEdgeRight: {
      top: 22,
      right: -10,
      bottom: 22,
      width: 20,
    },
    cropEdgeBottom: {
      right: 22,
      bottom: -10,
      left: 22,
      height: 20,
    },
    cropEdgeLeft: {
      top: 22,
      bottom: 22,
      left: -10,
      width: 20,
    },
    cropHandleTouchArea: {
      position: 'absolute',
      width: 48,
      height: 48,
      zIndex: 2,
    },
    cropHandleTop: {
      top: -10,
    },
    cropHandleBottom: {
      bottom: -10,
    },
    cropHandleLeft: {
      left: -10,
    },
    cropHandleRight: {
      right: -10,
    },
    cropHandleHorizontal: {
      position: 'absolute',
      width: 30,
      height: 3,
      backgroundColor: staticColors.white,
    },
    cropHandleHorizontalLeft: {
      left: 10,
    },
    cropHandleHorizontalRight: {
      right: 10,
    },
    cropHandleHorizontalTop: {
      top: 10,
    },
    cropHandleHorizontalBottom: {
      bottom: 10,
    },
    cropHandleVertical: {
      position: 'absolute',
      width: 3,
      height: 30,
      backgroundColor: staticColors.white,
    },
    cropHandleVerticalLeft: {
      left: 10,
    },
    cropHandleVerticalRight: {
      right: 10,
    },
    cropHandleVerticalTop: {
      top: 10,
    },
    cropHandleVerticalBottom: {
      bottom: 10,
    },
    controlPressed: {
      opacity: 0.88,
    },
    controlDisabled: {
      opacity: 0.5,
    },
  });
}
