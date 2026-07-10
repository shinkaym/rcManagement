import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { radius } from '@/shared/theme/tokens/radius';

type ColorOptionButtonProps = {
  colorValue: string;
  isSelected: boolean;
  onPressColor: (colorValue: string) => void;
};

export const ColorOptionButton = memo(function ColorOptionButtonComponent({
  colorValue,
  isSelected,
  onPressColor,
}: ColorOptionButtonProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable onPress={() => onPressColor(colorValue)} style={styles.colorOptionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.colorOptionOuter,
            isSelected ? { borderColor: colorValue } : null,
            pressed ? styles.colorOptionPressed : null,
          ]}
        >
          <View style={[styles.colorOptionInner, { backgroundColor: colorValue }]} />
        </View>
      )}
    </Pressable>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    colorOptionPressable: {
      borderRadius: radius.pill,
    },
    colorOptionOuter: {
      width: 34,
      height: 34,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: staticColors.transparent,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    colorOptionInner: {
      width: 22,
      height: 22,
      borderRadius: radius.pill,
    },
    colorOptionPressed: {
      opacity: 0.9,
    },
  });
}
