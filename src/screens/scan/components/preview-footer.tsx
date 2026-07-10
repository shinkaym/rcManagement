import { Download01Icon, MailSend02Icon } from '@hugeicons/core-free-icons';
import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { AppIcon } from '@/shared/ui/icon';

import { createStyles } from '../scan-screen.styles';

type PreviewFooterProps = {
  isWorking: boolean;
  message: string | null;
  onDownload: () => void;
  onSend: () => void;
};

export function PreviewFooter({ isWorking, message, onDownload, onSend }: PreviewFooterProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.previewFooter}>
      {message ? (
        <View style={styles.statusMessagePill}>
          <Text style={styles.statusMessageText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.previewActionsRow}>
        <TextActionButton disabled={isWorking} icon={Download01Icon} label='Download' onPress={onDownload} />

        <SendActionButton disabled={isWorking} onPress={onSend} />
      </View>
    </View>
  );
}

type TextActionButtonProps = {
  disabled?: boolean;
  icon: typeof Download01Icon;
  label: string;
  onPress: () => void;
};

function TextActionButton({ disabled = false, icon, label, onPress }: TextActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.textActionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.textActionButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}
        >
          <AppIcon icon={icon} size={20} color={staticColors.white} strokeWidth={2} />
          <Text style={styles.textActionLabel}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

type SendActionButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

function SendActionButton({ disabled = false, onPress }: SendActionButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.sendActionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.sendActionButton,
            disabled ? styles.controlDisabled : null,
            pressed ? styles.controlPressed : null,
          ]}
        >
          <AppIcon icon={MailSend02Icon} size={30} color='#1D8BFF' strokeWidth={1.8} />
        </View>
      )}
    </Pressable>
  );
}
