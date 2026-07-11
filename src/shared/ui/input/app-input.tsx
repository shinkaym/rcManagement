import { memo, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import type { AppTheme } from '@/shared/theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

import { resolveAppInputStrategy, type AppInputStrategyName } from './app-input-strategies';

type NativeInputProps = Omit<TextInputProps, 'onChangeText' | 'style' | 'value'>;

export type AppInputVariant = 'outlined' | 'soft';

type AppInputProps = NativeInputProps & {
  inputStyle?: StyleProp<TextStyle>;
  onChangeText: (value: string) => void;
  strategy?: AppInputStrategyName;
  value: string;
  variant?: AppInputVariant;
};

export const AppInput = memo(function AppInputComponent({
  editable = true,
  inputStyle,
  multiline = false,
  onChangeText,
  placeholderTextColor,
  strategy = 'text',
  value,
  variant = 'outlined',
  ...restProps
}: AppInputProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const resolvedStrategy = useMemo(() => resolveAppInputStrategy(strategy), [strategy]);
  const resolvedValue = useMemo(() => {
    if (value.length === 0) {
      return value;
    }

    return resolvedStrategy.getDisplayValue ? resolvedStrategy.getDisplayValue(value) : value;
  }, [resolvedStrategy, value]);

  const handleChangeText = useCallback(
    (nextValue: string) => {
      const resolvedNextValue = resolvedStrategy.getNextValue
        ? resolvedStrategy.getNextValue(nextValue)
        : nextValue;

      onChangeText(resolvedNextValue);
    },
    [onChangeText, resolvedStrategy],
  );

  return (
    <TextInput
      value={resolvedValue}
      onChangeText={handleChangeText}
      editable={editable}
      multiline={multiline}
      placeholderTextColor={placeholderTextColor ?? theme.colors.textHint}
      style={[
        styles.inputBase,
        variant === 'outlined' ? styles.inputOutlined : styles.inputSoft,
        multiline ? styles.inputMultiline : styles.inputSingleLine,
        !editable ? styles.inputReadonly : null,
        inputStyle,
      ]}
      textAlignVertical={multiline ? 'top' : 'center'}
      underlineColorAndroid='transparent'
      disableFullscreenUI
      {...resolvedStrategy.props}
      {...restProps}
    />
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    inputBase: {
      borderRadius: radius.md,
      borderCurve: 'continuous',
      paddingHorizontal: spacing.md,
      color: theme.colors.textSecondary,
      ...typography.bodyLarge,
      lineHeight: 22,
    },
    inputOutlined: {
      height: 48,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      includeFontPadding: false,
    },
    inputSoft: {
      height: 40,
      borderWidth: 0,
      backgroundColor: theme.colors.surfaceAlt,
      includeFontPadding: false,
    },
    inputSingleLine: {
      paddingVertical: 0,
    },
    inputMultiline: {
      minHeight: 96,
      height: undefined,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      includeFontPadding: true,
    },
    inputReadonly: {
      opacity: 0.72,
    },
  });
}
