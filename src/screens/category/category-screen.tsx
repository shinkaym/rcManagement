import { Settings02Icon } from '@hugeicons/core-free-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import ColorPicker, { HueSlider, Panel1 } from 'reanimated-color-picker';

import { ActionCard } from '@/features/category/components/action-card';
import { CategoryCard } from '@/features/category/components/category-card';
import { ColorOptionButton } from '@/features/category/components/color-option-button';
import { IconOptionButton } from '@/features/category/components/icon-option-button';
import { navigationMetrics } from '@/navigation/navigation-metrics';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';

import { isValidHexColor, normalizeHexColor } from '@/shared/utils/color';
import {
  categoryColorPresets,
  categoryIconGroups,
  customCategorySeed,
  defaultCategorySeed,
  type CategoryIconKey,
  type CategoryItem,
} from '../../mock/category-data';
import { AppTheme } from '@/shared/theme';

const addImageSource = require('../../../assets/images/add.png');

type EditableSource = 'default' | 'custom';

type SheetState = { mode: 'create' } | { categoryId: string; mode: 'edit'; source: EditableSource };

export function CategoryScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const sheetAnimation = useRef(new Animated.Value(0)).current;
  const [defaultCategories, setDefaultCategories] = useState(defaultCategorySeed);
  const [customCategories, setCustomCategories] = useState(customCategorySeed);
  const [sheetState, setSheetState] = useState<SheetState | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftColorValue, setDraftColorValue] = useState('#F57C00');
  const [draftIconKey, setDraftIconKey] = useState<CategoryIconKey>('food');
  const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);

  const sheetVisible = sheetState !== null;
  const normalizedDraftColor = normalizeHexColor(draftColorValue);
  const isDraftColorValid = isValidHexColor(normalizedDraftColor);

  useEffect(() => {
    if (!sheetVisible) {
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
  }, [sheetAnimation, sheetVisible]);

  const openCreateSheet = useCallback(() => {
    setDraftName('');
    setDraftColorValue('#F57C00');
    setDraftIconKey('food');
    setIsCustomPickerOpen(false);
    setSheetState({ mode: 'create' });
  }, []);

  const openEditSheet = useCallback((category: CategoryItem, source: EditableSource) => {
    setDraftName(category.label);
    setDraftColorValue(category.colorValue);
    setDraftIconKey(category.iconKey);
    setIsCustomPickerOpen(!categoryColorPresets.includes(category.colorValue as (typeof categoryColorPresets)[number]));
    setSheetState({
      mode: 'edit',
      source,
      categoryId: category.id,
    });
  }, []);

  const openDefaultEditSheet = useCallback(
    (category: CategoryItem) => {
      openEditSheet(category, 'default');
    },
    [openEditSheet],
  );

  const openCustomEditSheet = useCallback(
    (category: CategoryItem) => {
      openEditSheet(category, 'custom');
    },
    [openEditSheet],
  );

  const handleSelectColorPreset = useCallback((colorValue: string) => {
    setDraftColorValue(colorValue);
    setIsCustomPickerOpen(false);
  }, []);

  const handleSelectIcon = useCallback((iconKey: CategoryIconKey) => {
    setDraftIconKey(iconKey);
  }, []);

  const handleEditPlaceholderPress = useCallback(() => {
    Alert.alert(
      'Edit button',
      'This temporary tile is only here as a visual placeholder for the separate edit entry.',
    );
  }, []);

  function closeSheet() {
    setSheetState(null);
  }

  function handleConfirm() {
    const trimmedName = draftName.trim();

    if (!trimmedName || !isDraftColorValid) {
      return;
    }

    if (!sheetState || sheetState.mode === 'create') {
      const nextCategory: CategoryItem = {
        colorValue: normalizedDraftColor,
        id: `custom-${Date.now()}`,
        iconKey: draftIconKey,
        label: trimmedName,
      };

      setCustomCategories((current) => [...current, nextCategory]);
      closeSheet();
      return;
    }

    const updater = (items: CategoryItem[]) =>
      items.map((item) =>
        item.id === sheetState.categoryId
          ? {
              ...item,
              colorValue: normalizedDraftColor,
              iconKey: draftIconKey,
              label: trimmedName,
            }
          : item,
      );

    if (sheetState.source === 'default') {
      setDefaultCategories(updater);
    } else {
      setCustomCategories(updater);
    }

    closeSheet();
  }

  const confirmDisabled = draftName.trim().length === 0;
  const sheetTranslateY = sheetAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 0],
  });

  return (
    <>
      <StatusBar barStyle='dark-content' />
      <View style={styles.screen}>
        <ScrollView
          contentInsetAdjustmentBehavior='automatic'
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.contentColumn}>
            <CategorySection
              items={defaultCategories}
              title='Default List'
              onItemPress={openDefaultEditSheet}
            />

            <View style={styles.sectionSpacer}>
              <Text style={styles.sectionTitle}>Custom List</Text>
              <View style={styles.grid}>
                {customCategories.map((item) => (
                  <CategoryCard key={item.id} item={item} onPressItem={openCustomEditSheet} />
                ))}

                <ActionCard imageSource={addImageSource} label='Create' variant='dashed' onPress={openCreateSheet} />

                <ActionCard
                  icon={Settings02Icon}
                  label='Edit'
                  variant='edit'
                  onPress={handleEditPlaceholderPress}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal animationType='fade' transparent visible={sheetVisible} onRequestClose={closeSheet}>
          <View style={styles.modalRoot}>
            <Pressable style={styles.dismissArea} onPress={closeSheet}>
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
                <Text style={styles.sheetTitle}>
                  {sheetState?.mode === 'edit' ? 'Edit Category' : 'Create Category'}
                </Text>

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
                      <Text style={styles.confirmLabel}>
                        {sheetState?.mode === 'edit' ? 'Save Category' : 'Confirm & Add'}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </>
  );
}

type CategorySectionProps = {
  items: CategoryItem[];
  onItemPress: (item: CategoryItem) => void;
  title: string;
};

function CategorySection({ items, onItemPress, title }: CategorySectionProps) {
  const styles = createStyles(useAppTheme());

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <CategoryCard key={item.id} item={item} onPressItem={onItemPress} />
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingTop: spacing.sm,
      paddingRight: spacing.lg,
      paddingBottom: navigationMetrics.contentBottomInset,
      paddingLeft: spacing.lg,
    },
    contentColumn: {
      width: '100%',
      maxWidth: 440,
      alignSelf: 'center',
    },
    sectionSpacer: {
      marginTop: spacing.xxl,
    },
    sectionTitle: {
      ...typography.titleLarge,
      color: theme.colors.textSecondary,
      marginBottom: spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
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
