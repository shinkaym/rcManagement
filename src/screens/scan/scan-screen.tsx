import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { launchImageLibrary } from 'react-native-image-picker';
import PhotoManipulator, { MimeType, RotationMode } from 'react-native-photo-manipulator';
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Camera, useCameraDevice, usePhotoOutput, type CameraRef } from 'react-native-vision-camera';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Image, Platform, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { CaptureModeView } from './components/capture-mode-view';
import { CameraBackdrop } from './components/camera-backdrop';
import { CropModeView } from './components/crop-mode-view';
import { PreviewModeView } from './components/preview-mode-view';
import { mapCropRectToImagePixels } from './scan-geometry';
import { createStyles } from './scan-screen.styles';
import type { CameraPermissionStatus, CropRect, ImageFrame, PreviewImageState, ScreenMode } from './scan-types';

type ScanScreenProps = {
  onBackToHome?: () => void;
  onSendImage?: () => void;
};

type MediaPermissionKind = 'read' | 'save';

export function ScanScreen({ onBackToHome, onSendImage }: ScanScreenProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top, insets.bottom), [insets.bottom, insets.top, theme]);
  const cameraRef = useRef<CameraRef | null>(null);
  const photoOutput = usePhotoOutput();
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [cropDraftImage, setCropDraftImage] = useState<PreviewImageState | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isRetryingCamera, setIsRetryingCamera] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [mode, setMode] = useState<ScreenMode>('capture');
  const [previewImage, setPreviewImage] = useState<PreviewImageState | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<CameraPermissionStatus>('checking');
  const device = useCameraDevice(cameraFacing, { physicalDevices: ['wide-angle'] });
  const hasCameraPermission = cameraPermissionStatus === 'granted';

  const shouldShowCameraOverlay =
    mode === 'capture' && (!hasCameraPermission || !device || !isCameraReady || isRetryingCamera);
  const shouldRenderCamera = hasCameraPermission && !!device;
  const isCaptureMode = mode === 'capture';

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

  function showMessage(message: string) {
    setStatusMessage(message);
  }

  async function settleTorchBeforeLeavingCapture() {
    if (mode !== 'capture' || !isFlashEnabled || !device?.hasTorch) {
      return;
    }

    setIsFlashEnabled(false);

    await waitForAnimationFrame();
    await waitForAnimationFrame();
  }

  async function handleBackToHome() {
    await settleTorchBeforeLeavingCapture();
    onBackToHome?.();
  }

  async function handleHeaderBackPress() {
    if (mode === 'capture') {
      await handleBackToHome();
      return;
    }

    handleClosePreview();
  }

  function handleClosePreview() {
    setCropDraftImage(null);
    setIsFlashEnabled(false);
    setIsCameraReady(false);
    setMode('capture');
    setPreviewImage(null);
    setStatusMessage(null);
  }

  function handleToggleFlash() {
    if (mode !== 'capture' || !isCameraReady || isWorking || isCapturing || !device?.hasTorch) {
      return;
    }

    setIsFlashEnabled((currentValue) => !currentValue);
  }

  async function handleSwitchCamera() {
    if (mode !== 'capture') {
      return;
    }

    await settleTorchBeforeLeavingCapture();
    setIsCameraReady(false);
    setCameraFacing((currentValue) => (currentValue === 'back' ? 'front' : 'back'));
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

      await settleTorchBeforeLeavingCapture();
      setCropDraftImage(null);
      setMode('preview');
      setPreviewImage(
        await createPreviewImageState(selectedUri, {
          width: selectedAsset.width,
          height: selectedAsset.height,
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

      await settleTorchBeforeLeavingCapture();
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

    setMode(nextMode);
  }

  async function handleSaveCrop(cropRect: CropRect, imageFrame: ImageFrame) {
    if (!cropDraftImage) {
      return;
    }

    const cropInPixels = mapCropRectToImagePixels(cropRect, imageFrame, cropDraftImage);

    setIsWorking(true);

    try {
      const croppedUri = await PhotoManipulator.crop(cropDraftImage.uri, cropInPixels, undefined, MimeType.JPEG);
      setPreviewImage(await createPreviewImageState(ensureFileUri(croppedUri) ?? croppedUri));
      setCropDraftImage(null);
      setMode('preview');
    } catch {
      showMessage('Unable to crop the image right now.');
    } finally {
      setIsWorking(false);
    }
  }

  function handleCancelCrop() {
    setCropDraftImage(null);
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
        {shouldRenderCamera ? (
          <CaptureCameraLayer
            cameraRef={cameraRef}
            device={device}
            isActive={isCaptureMode}
            isCameraReady={isCameraReady}
            isFlashEnabled={isFlashEnabled}
            onCameraError={() => showMessage('Unable to start camera right now.')}
            onPreviewStarted={() => setIsCameraReady(true)}
            onPreviewStopped={() => setIsCameraReady(false)}
            photoOutput={photoOutput}
          />
        ) : null}

        {isCaptureMode && !shouldRenderCamera ? <CameraBackdrop /> : null}

        {isCaptureMode ? (
          <CaptureModeView
            cameraPermissionStatus={cameraPermissionStatus}
            hasCameraPermission={hasCameraPermission}
            hasCameraDevice={!!device}
            isCameraReady={isCameraReady}
            isCapturing={isCapturing}
            isFlashEnabled={isFlashEnabled}
            isRetryingCamera={isRetryingCamera}
            isWorking={isWorking}
            message={statusMessage}
            shouldShowCameraOverlay={shouldShowCameraOverlay}
            onBackPress={handleHeaderBackPress}
            onCapture={handleCaptureImage}
            onOpenGallery={handleOpenGallery}
            onOpenSettings={() => {
              openSettings('application').catch(() => {
                showMessage('Unable to open settings right now.');
              });
            }}
            onRetryCamera={handleRetryCamera}
            onSwitchCamera={handleSwitchCamera}
            onToggleFlash={handleToggleFlash}
          />
        ) : null}

        {mode === 'preview' && previewImage ? (
          <PreviewModeView
            image={previewImage}
            isWorking={isWorking}
            message={statusMessage}
            onBackPress={handleHeaderBackPress}
            onCrop={handleEnterCropMode}
            onDownload={handleDownloadImage}
            onEdit={handlePreviewPlaceholderAction}
            onRotate={handleRotatePreviewImage}
            onSend={handleSendImage}
          />
        ) : null}

        {mode === 'crop' && cropDraftImage ? (
          <CropModeView
            image={cropDraftImage}
            isWorking={isWorking}
            message={statusMessage}
            onCancel={handleCancelCrop}
            onDone={handleSaveCrop}
            onRotate={handleRotatePreviewImage}
          />
        ) : null}
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

function waitForAnimationFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

type CaptureCameraLayerProps = {
  cameraRef: RefObject<CameraRef | null>;
  device: NonNullable<ReturnType<typeof useCameraDevice>>;
  isActive: boolean;
  isCameraReady: boolean;
  isFlashEnabled: boolean;
  onCameraError: () => void;
  onPreviewStarted: () => void;
  onPreviewStopped: () => void;
  photoOutput: ReturnType<typeof usePhotoOutput>;
};

function CaptureCameraLayer({
  cameraRef,
  device,
  isActive,
  isCameraReady,
  isFlashEnabled,
  onCameraError,
  onPreviewStarted,
  onPreviewStopped,
  photoOutput,
}: CaptureCameraLayerProps) {
  const styles = createStyles(useAppTheme(), 0, 0);
  const torchMode = isActive && isCameraReady && isFlashEnabled && device.hasTorch ? 'on' : undefined;

  return (
    <Camera
      ref={cameraRef}
      style={styles.cameraPreview}
      device={device}
      implementationMode='compatible'
      isActive={isActive}
      outputs={[photoOutput]}
      resizeMode='cover'
      torchMode={torchMode}
      onError={onCameraError}
      onPreviewStarted={onPreviewStarted}
      onPreviewStopped={onPreviewStopped}
    />
  );
}
