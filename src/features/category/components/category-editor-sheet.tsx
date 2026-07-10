import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';

import {
  categoryColorPresets,
  categoryIconGroups,
  type CategoryIconKey,
  type CategoryItem,
} from '@/mock/category-data';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { AppTheme } from '@/shared/theme';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';
import { isValidHexColor, normalizeHexColor } from '@/shared/utils/color';

import { ColorOptionButton } from './color-option-button';
import { IconOptionButton } from './icon-option-button';

export type CategoryEditorPayload = {
  colorValue: string;
  iconKey: CategoryIconKey;
  label: string;
};

type CategoryEditorSheetProps = {
  category?: CategoryItem | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onConfirm: (payload: CategoryEditorPayload) => void;
  visible: boolean;
};

const defaultDraft: CategoryEditorPayload = {
  colorValue: '#F57C00',
  iconKey: 'food',
  label: '',
};

export const CategoryEditorSheet = memo(function CategoryEditorSheetComponent({
  category,
  mode,
  onClose,
  onConfirm,
  visible,
}: CategoryEditorSheetProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const sheetAnimation = useRef(new Animated.Value(0)).current;
  const [draftName, setDraftName] = useState(defaultDraft.label);
  const [draftColorValue, setDraftColorValue] = useState(defaultDraft.colorValue);
  const [draftIconKey, setDraftIconKey] = useState<CategoryIconKey>(defaultDraft.iconKey);
  const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);

  const normalizedDraftColor = normalizeHexColor(draftColorValue);
  const isDraftColorValid = isValidHexColor(normalizedDraftColor);
  const confirmDisabled = draftName.trim().length === 0;
  const sheetTranslateY = sheetAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 0],
  });

  useEffect(() => {
    if (!visible) {
      sheetAnimation.setValue(0);
      return;
    }

    Animated.spring(sheetAnimation, {
      damping: 18,
      mass: 0.9,
      stiffness: 180,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [sheetAnimation, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const nextDraft =
      mode === 'edit' && category
        ? {
            colorValue: category.colorValue,
            iconKey: category.iconKey,
            label: category.label,
          }
        : defaultDraft;

    setDraftName(nextDraft.label);
    setDraftColorValue(nextDraft.colorValue);
    setDraftIconKey(nextDraft.iconKey);
    setIsCustomPickerOpen(
      !categoryColorPresets.includes(nextDraft.colorValue as (typeof categoryColorPresets)[number]),
    );
  }, [category, mode, visible]);

  const handleSelectColorPreset = useCallback((colorValue: string) => {
    setDraftColorValue(colorValue);
    setIsCustomPickerOpen(false);
  }, []);

  const handleSelectIcon = useCallback((iconKey: CategoryIconKey) => {
    setDraftIconKey(iconKey);
  }, []);

  function handleConfirm() {
    const trimmedName = draftName.trim();

    if (!trimmedName || !isDraftColorValid) {
      return;
    }

    onConfirm({
      colorValue: normalizedDraftColor,
      iconKey: draftIconKey,
      label: trimmedName,
    });
  }

  return (
    <Modal animationType='fade' transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.dismissArea} onPress={onClose}>
          <View style={styles.scrim} />
        </Pressable>

        <Animated.View
          style={[
            styles.sheetContainer,
            {
              opacity: sheetAnimation,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View style={styles.sheetHandle} />

          <ScrollView
            contentInsetAdjustmentBehavior='automatic'
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={styles.sheetContent}
          >
            <Text style={styles.sheetTitle}>{mode === 'edit' ? 'Edit Category' : 'Create Category'}</Text>

            <TextInput
              placeholder='Input category name'
              placeholderTextColor={theme.colors.textHint}
              style={styles.nameInput}
              value={draftName}
              onChangeText={setDraftName}
            />

            <View style={styles.colorGroup}>
              <Text style={styles.iconGroupTitle}>Color</Text>

              <View style={styles.colorGrid}>
                {categoryColorPresets.map((colorValue) => (
                  <ColorOptionButton
                    key={colorValue}
                    colorValue={colorValue}
                    isSelected={normalizedDraftColor === colorValue}
                    onPressColor={handleSelectColorPreset}
                  />
                ))}
              </View>

              <Pressable
                onPress={() => setIsCustomPickerOpen((current) => !current)}
                style={styles.customPickerTogglePressable}
              >
                {({ pressed }) => (
                  <View style={[styles.customPickerToggle, pressed ? styles.customPickerTogglePressed : null]}>
                    <View
                      style={[
                        styles.customPickerBar,
                        isDraftColorValid
                          ? { backgroundColor: normalizedDraftColor }
                          : styles.customPickerBarInvalid,
                      ]}
                    />
                  </View>
                )}
              </Pressable>

              {isCustomPickerOpen ? (
                <View style={styles.customPickerCard}>
                  <ColorPicker
                    adaptSpectrum
                    style={styles.colorPicker}
                    thumbSize={22}
                    value={normalizedDraftColor}
                    onChangeJS={(colors) => setDraftColorValue(colors.hex)}
                  >
                    <Panel1 style={styles.colorPickerPanel} />
                    <HueSlider style={styles.colorPickerHue} />
                  </ColorPicker>
                </View>
              ) : null}
            </View>

            {categoryIconGroups.map((group) => (
              <View key={group.title} style={styles.iconGroup}>
                <Text style={styles.iconGroupTitle}>{group.title}</Text>
                <View style={styles.iconGrid}>
                  {group.iconKeys.map((iconKey) => (
                    <IconOptionButton
                      key={iconKey}
                      accentColorValue={normalizedDraftColor}
                      iconKey={iconKey}
                      isSelected={draftIconKey === iconKey}
                      onPressIcon={handleSelectIcon}
                    />
                  ))}
                </View>
              </View>
            ))}

            <Pressable disabled={confirmDisabled} onPress={handleConfirm} style={styles.confirmPressable}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.confirmButton,
                    confirmDisabled ? styles.confirmButtonDisabled : null,
                    pressed && !confirmDisabled ? styles.confirmButtonPressed : null,
                  ]}
                >
                  <Text style={styles.confirmLabel}>{mode === 'edit' ? 'Save Category' : 'Confirm & Add'}</Text>
                </View>
              )}
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    dismissArea: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    scrim: {
      flex: 1,
      backgroundColor: 'rgba(25, 28, 29, 0.28)',
    },
    sheetContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: radius.xxl,
      borderTopRightRadius: radius.xxl,
      borderCurve: 'continuous',
      paddingTop: spacing.xs,
      boxShadow: theme.shadow.sheet,
      maxHeight: '82%',
    },
    sheetHandle: {
      width: 52,
      height: 5,
      borderRadius: radius.pill,
      alignSelf: 'center',
      backgroundColor: theme.colors.borderAlt,
      marginBottom: spacing.md,
    },
    sheetContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.lg,
    },
    sheetTitle: {
      ...typography.titleLarge,
      color: theme.colors.textSecondary,
    },
    nameInput: {
      ...typography.bodyLarge,
      height: 52,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: 0,
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.surface,
      lineHeight: 22,
      includeFontPadding: false,
    },
    iconGroup: {
      gap: spacing.sm,
    },
    colorGroup: {
      gap: spacing.sm,
    },
    iconGroupTitle: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    customPickerTogglePressable: {
      borderRadius: radius.lg,
    },
    customPickerToggle: {
      minHeight: 48,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },
    customPickerTogglePressed: {
      opacity: 0.92,
    },
    customPickerCard: {
      borderRadius: radius.xl,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      padding: spacing.sm,
      gap: spacing.sm,
    },
    customPickerBar: {
      width: '100%',
      height: 18,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: 'rgba(25, 28, 29, 0.08)',
    },
    customPickerBarInvalid: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    colorPicker: {
      width: '100%',
      gap: spacing.sm,
    },
    colorPickerPanel: {
      width: '100%',
      height: 160,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
    },
    colorPickerHue: {
      width: '100%',
    },
    iconGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    confirmPressable: {
      borderRadius: radius.lg,
    },
    confirmButton: {
      minHeight: 54,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      boxShadow: theme.shadow.accentSoft,
    },
    confirmButtonDisabled: {
      opacity: 0.45,
    },
    confirmButtonPressed: {
      opacity: 0.92,
    },
    confirmLabel: {
      ...typography.titleMedium,
      color: theme.colors.surface,
    },
  });
}
