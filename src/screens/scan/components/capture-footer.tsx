import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { createStyles } from '../scan-screen.styles';

type CaptureFooterProps = {
  isBusy: boolean;
  message: string | null;
  onCapture: () => void;
};

export function CaptureFooter({
  isBusy,
  message,
  onCapture,
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

      <CaptureButton isBusy={isBusy} onPress={onCapture} />
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
