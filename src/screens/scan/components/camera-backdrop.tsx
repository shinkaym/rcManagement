import { memo } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { createStyles } from '../scan-screen.styles';

export const CameraBackdrop = memo(function CameraBackdropComponent() {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <View style={styles.previewBackdrop}>
      <View style={styles.previewGlowTop} />
      <View style={styles.previewGlowBottom} />
    </View>
  );
});
