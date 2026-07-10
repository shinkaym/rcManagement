import { MinusSignIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { AppIcon } from '@/shared/ui/icon';

import { createStyles } from '../scan-screen.styles';

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

export function CaptureFooter({
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
