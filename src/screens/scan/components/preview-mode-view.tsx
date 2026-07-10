import { memo, useMemo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanHeader } from '@/navigation/components/scan-header';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { createStyles } from '../scan-screen.styles';
import type { PreviewImageState } from '../scan-types';
import { CameraBackdrop } from './camera-backdrop';
import { PreviewFooter } from './preview-footer';
import { PreviewImageStage } from './preview-image-stage';

type PreviewModeViewProps = {
  image: PreviewImageState;
  isFlashEnabled: boolean;
  isWorking: boolean;
  message: string | null;
  onBackPress: () => void;
  onCrop: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onOpenGallery: () => void;
  onRotate: () => void;
  onSend: () => void;
  onSwitchCamera: () => void;
  onToggleFlash: () => void;
};

export const PreviewModeView = memo(function PreviewModeViewComponent({
  image,
  isFlashEnabled,
  isWorking,
  message,
  onBackPress,
  onCrop,
  onDownload,
  onEdit,
  onOpenGallery,
  onRotate,
  onSend,
  onSwitchCamera,
  onToggleFlash,
}: PreviewModeViewProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top, insets.bottom), [insets.bottom, insets.top, theme]);

  return (
    <>
      <CameraBackdrop />

      <View style={styles.content}>
        <ScanHeader
          isFlashEnabled={isFlashEnabled}
          isWorking={isWorking}
          mode='preview'
          onBackPress={onBackPress}
          onCrop={onCrop}
          onEdit={onEdit}
          onOpenGallery={onOpenGallery}
          onRotate={onRotate}
          onSwitchCamera={onSwitchCamera}
          onToggleFlash={onToggleFlash}
        />

        <PreviewImageStage image={image} />

        <PreviewFooter isWorking={isWorking} message={message} onDownload={onDownload} onSend={onSend} />
      </View>
    </>
  );
});
