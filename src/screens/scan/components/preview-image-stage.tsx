import { memo } from 'react';
import { Image, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { createStyles } from '../scan-screen.styles';
import type { PreviewImageState } from '../scan-types';

type PreviewImageStageProps = {
  image: PreviewImageState;
};

export const PreviewImageStage = memo(function PreviewImageStageComponent({ image }: PreviewImageStageProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <View style={styles.centerStage}>
      <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode='contain' />
    </View>
  );
});
