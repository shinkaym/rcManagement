import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  expenseCategoryIconCatalog,
  type ExpenseCategoryIconCode,
} from '@/features/category/model/category-icon';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { createFocusRingShadow } from '@/shared/theme/tokens/shadow';
import { radius } from '@/shared/theme/tokens/radius';
import { AppIcon } from '@/shared/ui/icon';
import { isValidHexColor, normalizeHexColor, toSoftColor } from '@/shared/utils/color';

type IconOptionButtonProps = {
  accentColorValue: string;
  iconCode: ExpenseCategoryIconCode;
  isSelected: boolean;
  onPressIcon: (iconCode: ExpenseCategoryIconCode) => void;
};

export const IconOptionButton = memo(function IconOptionButtonComponent({
  accentColorValue,
  iconCode,
  isSelected,
  onPressIcon,
}: IconOptionButtonProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconPreset = expenseCategoryIconCatalog[iconCode];
  const normalizedColor = normalizeHexColor(accentColorValue);
  const solidColor = isValidHexColor(normalizedColor) ? normalizedColor : theme.colors.primary;
  const softColor = isValidHexColor(normalizedColor) ? toSoftColor(normalizedColor) : theme.colors.surfaceAlt;

  return (
    <Pressable onPress={() => onPressIcon(iconCode)} style={styles.iconOptionPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.iconOption,
            isSelected ? { backgroundColor: softColor } : styles.iconOptionIdle,
            isSelected
              ? [
                  styles.iconOptionSelected,
                  {
                    borderColor: solidColor,
                    boxShadow: createFocusRingShadow(softColor),
                  },
                ]
              : null,
            pressed ? styles.iconOptionPressed : null,
          ]}
        >
          <AppIcon
            color={isSelected ? solidColor : theme.colors.textHint}
            icon={iconPreset.icon}
            size={20}
            strokeWidth={2.2}
          />
        </View>
      )}
    </Pressable>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    iconOptionPressable: {
      borderRadius: radius.md,
    },
    iconOption: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(25, 28, 29, 0.08)',
    },
    iconOptionIdle: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    iconOptionSelected: {
      borderWidth: 1,
    },
    iconOptionPressed: {
      opacity: 0.92,
    },
  });
}
