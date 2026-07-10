import { Cancel01Icon, RotateCcwSquareIcon } from '@hugeicons/core-free-icons';
import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { AppIcon } from '@/shared/ui/icon';

import { createStyles } from '../scan-screen.styles';

type CropFooterProps = {
  isWorking: boolean;
  message: string | null;
  onCancel: () => void;
  onDone: () => void;
  onRotate: () => void;
};

export function CropFooter({ isWorking, message, onCancel, onDone, onRotate }: CropFooterProps) {
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
