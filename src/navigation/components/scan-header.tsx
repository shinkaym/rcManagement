import {
  ArrowLeft01Icon,
  CameraRotated01Icon,
  Cancel01Icon,
  CropIcon,
  Edit02Icon,
  FlashIcon,
  FlashOffIcon,
  Image01Icon,
  Rotate01Icon,
} from '@hugeicons/core-free-icons';
import { AppIcon } from '@/shared/ui/icon';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { AppTheme } from '@/shared/theme';

type ScanHeaderMode = 'capture' | 'preview';

type ScanHeaderProps = {
  isFlashEnabled?: boolean;
  isWorking?: boolean;
  mode: ScanHeaderMode;
  onBackPress: () => void;
  onCrop?: () => void;
  onEdit?: () => void;
  onOpenGallery?: () => void;
  onRotate?: () => void;
  onSwitchCamera?: () => void;
  onToggleFlash?: () => void;
};

export function ScanHeader({
  isFlashEnabled = false,
  isWorking = false,
  mode,
  onBackPress,
  onCrop,
  onEdit,
  onOpenGallery,
  onRotate,
  onSwitchCamera,
  onToggleFlash,
}: ScanHeaderProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top);

  return (
    <View style={styles.container}>
      <HeaderSurfaceButton
        accent
        disabled={isWorking}
        icon={mode === 'capture' ? ArrowLeft01Icon : Cancel01Icon}
        onPress={onBackPress}
      />

      {mode === 'capture' ? (
        <View style={styles.actionsGroup}>
          <HeaderSurfaceButton disabled={isWorking} icon={Image01Icon} onPress={onOpenGallery} />
          <HeaderSurfaceButton
            disabled={isWorking}
            icon={isFlashEnabled ? FlashIcon : FlashOffIcon}
            isActive={isFlashEnabled}
            onPress={onToggleFlash}
          />
          <HeaderSurfaceButton disabled={isWorking} icon={CameraRotated01Icon} onPress={onSwitchCamera} />
        </View>
      ) : (
        <View style={styles.actionsGroup}>
          <HeaderSurfaceButton disabled={isWorking} icon={CropIcon} onPress={onCrop} />
          <HeaderSurfaceButton disabled={isWorking} icon={Rotate01Icon} onPress={onRotate} />
          <HeaderSurfaceButton disabled={isWorking} icon={Edit02Icon} onPress={onEdit} />
        </View>
      )}
    </View>
  );
}

type HeaderSurfaceButtonProps = {
  accent?: boolean;
  disabled?: boolean;
  icon: typeof ArrowLeft01Icon;
  isActive?: boolean;
  onPress?: () => void;
};

function HeaderSurfaceButton({
  accent = false,
  disabled = false,
  icon,
  isActive = false,
  onPress,
}: HeaderSurfaceButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0);

  return (
    <Pressable disabled={disabled || !onPress} onPress={onPress} style={styles.buttonPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.button,
            accent ? styles.buttonAccent : null,
            isActive ? styles.buttonActive : null,
            disabled ? styles.buttonDisabled : null,
            pressed && !disabled ? styles.buttonPressed : null,
          ]}
        >
          <AppIcon color={staticColors.white} icon={icon} size={20} strokeWidth={2.1} />
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: AppTheme, topInset: number) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48,
      paddingTop: topInset > 0 ? topInset + spacing.xs : spacing.lg,
      zIndex: 3,
    },
    actionsGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
      boxShadow: theme.shadow.elevated,
    },
    buttonPressable: {
      borderRadius: radius.pill,
    },
    button: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
    },
    buttonAccent: {
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
    },
    buttonActive: {
      backgroundColor: 'rgba(245, 124, 0, 0.32)',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonPressed: {
      opacity: 0.88,
    },
  });
}
