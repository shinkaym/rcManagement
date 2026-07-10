import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';

import { createStyles } from '../scan-screen.styles';

type CameraStatusOverlayProps = {
  canOpenSettings: boolean;
  errorMessage: string;
  isLoading: boolean;
  onOpenSettings: () => void;
  onRetry: () => void;
};

export function CameraStatusOverlay({
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
