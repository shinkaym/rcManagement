import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Image, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { createDefaultCropRect, getContainedFrame } from '../scan-geometry';
import { createStyles } from '../scan-screen.styles';
import type { CropRect, ImageFrame, PreviewImageState, StageLayout } from '../scan-types';
import { CameraBackdrop } from './camera-backdrop';
import { CropFooter } from './crop-footer';
import { CropOverlay } from './crop-overlay';

type CropModeViewProps = {
  image: PreviewImageState;
  isWorking: boolean;
  message: string | null;
  onCancel: () => void;
  onDone: (cropRect: CropRect, imageFrame: ImageFrame) => void;
  onRotate: () => void;
};

export const CropModeView = memo(function CropModeViewComponent({
  image,
  isWorking,
  message,
  onCancel,
  onDone,
  onRotate,
}: CropModeViewProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top, insets.bottom), [insets.bottom, insets.top, theme]);
  const [stageLayout, setStageLayout] = useState<StageLayout>({ width: 0, height: 0 });
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const imageFrame = useMemo(() => getContainedFrame(stageLayout, image), [image, stageLayout]);

  useEffect(() => {
    if (!imageFrame) {
      return;
    }

    setCropRect(createDefaultCropRect(imageFrame));
  }, [imageFrame]);

  const handleStageLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setStageLayout((currentValue) => {
      if (currentValue.width === width && currentValue.height === height) {
        return currentValue;
      }

      return { width, height };
    });
  }, []);

  const handleDone = useCallback(() => {
    if (!cropRect || !imageFrame) {
      return;
    }

    onDone(cropRect, imageFrame);
  }, [cropRect, imageFrame, onDone]);

  return (
    <>
      <CameraBackdrop />

      <View style={styles.content}>
        <View style={styles.centerStage} onLayout={handleStageLayout}>
          <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode='contain' />

          {imageFrame && cropRect ? (
            <CropOverlay imageFrame={imageFrame} cropRect={cropRect} onChangeRect={setCropRect} />
          ) : null}
        </View>

        <CropFooter
          isWorking={isWorking}
          message={message}
          onCancel={onCancel}
          onDone={handleDone}
          onRotate={onRotate}
        />
      </View>
    </>
  );
});
