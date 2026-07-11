import { memo, useMemo } from 'react';
import { Home01Icon } from '@hugeicons/core-free-icons';
import { AppIcon } from '@/shared/ui/icon';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';
import { AppTheme } from '@/shared/theme';

export type SegmentTabItem<T> = {
  icon?: typeof Home01Icon;
  label: string;
  value: T;
};

type SegmentTabsProps<T> = {
  isWrapped?: boolean;
  items: SegmentTabItem<T>[];
  itemWidth?: `${number}%` | number;
  onChange: (value: T) => void;
  selectedValue: T;
};

function SegmentTabsComponent<T>({
  isWrapped = false,
  items,
  itemWidth = '48%',
  onChange,
  selectedValue,
}: SegmentTabsProps<T>) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, isWrapped ? styles.containerWrapped : null]}>
      {items.map((item) => {
        const isSelected = item.value === selectedValue;

        return (
          <Pressable
            key={String(item.value)}
            onPress={() => onChange(item.value)}
            style={[
              styles.buttonPressable,
              isWrapped ? styles.buttonPressableWrapped : null,
              isWrapped ? { width: itemWidth } : null,
            ]}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.button,
                  isSelected ? styles.buttonSelected : null,
                  pressed && !isSelected ? styles.buttonPressed : null,
                ]}
              >
                {item.icon ? (
                  <AppIcon
                    icon={item.icon}
                    color={isSelected ? theme.colors.surface : theme.colors.textSecondary}
                    size={15}
                    strokeWidth={1.8}
                  />
                ) : null}
                <Text style={[styles.label, isSelected ? styles.labelSelected : null]}>{item.label}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export const SegmentTabs = memo(SegmentTabsComponent) as typeof SegmentTabsComponent;

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: spacing.xxs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
    },
    containerWrapped: {
      flexWrap: 'wrap',
      gap: spacing.xxs,
    },
    buttonPressable: {
      flex: 1,
      borderRadius: radius.pill,
      overflow: 'hidden',
    },
    buttonPressableWrapped: {
      flexGrow: 1,
      flexBasis: 'auto',
      flexShrink: 0,
    },
    button: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.xxs,
    },
    buttonSelected: {
      backgroundColor: theme.colors.primary,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    label: {
      ...typography.labelLarge,
      color: theme.colors.textSecondary,
      fontFamily: typography.titleMedium.fontFamily,
      fontSize: 13,
      lineHeight: 18,
    },
    labelSelected: {
      color: theme.colors.surface,
    },
  });
}
