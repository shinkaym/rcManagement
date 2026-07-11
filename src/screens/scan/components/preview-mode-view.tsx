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
  isWorking: boolean;
  message: string | null;
  onBackPress: () => void;
  onCrop: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onRotate: () => void;
  onSend: () => void;
};

export const PreviewModeView = memo(function PreviewModeViewComponent({
  image,
  isWorking,
  message,
  onBackPress,
  onCrop,
  onDownload,
  onEdit,
  onRotate,
  onSend,
}: PreviewModeViewProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.top, insets.bottom), [insets.bottom, insets.top, theme]);

  return (
    <>
      <CameraBackdrop />

      <View style={styles.content}>
        <ScanHeader
          isWorking={isWorking}
          mode='preview'
          onBackPress={onBackPress}
          onCrop={onCrop}
          onEdit={onEdit}
          onRotate={onRotate}
        />

        <PreviewImageStage image={image} />

        <PreviewFooter isWorking={isWorking} message={message} onDownload={onDownload} onSend={onSend} />
      </View>
    </>
  );
});
