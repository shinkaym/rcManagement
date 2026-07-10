import { Settings02Icon } from '@hugeicons/core-free-icons';
import { memo, useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { ActionCard } from '@/features/category/components/action-card';
import { CategoryCard } from '@/features/category/components/category-card';
import { CategoryEditorSheet, type CategoryEditorPayload } from '@/features/category/components/category-editor-sheet';
import { navigationMetrics } from '@/navigation/navigation-metrics';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

import {
  customCategorySeed,
  defaultCategorySeed,
  type CategoryItem,
} from '../../mock/category-data';
import { AppTheme } from '@/shared/theme';

const addImageSource = require('../../../assets/images/add.png');

type EditableSource = 'default' | 'custom';

type SheetState = { mode: 'create' } | { categoryId: string; mode: 'edit'; source: EditableSource };

export function CategoryScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [defaultCategories, setDefaultCategories] = useState(defaultCategorySeed);
  const [customCategories, setCustomCategories] = useState(customCategorySeed);
  const [sheetState, setSheetState] = useState<SheetState | null>(null);

  const sheetVisible = sheetState !== null;
  const editedCategory =
    sheetState?.mode === 'edit'
      ? (sheetState.source === 'default' ? defaultCategories : customCategories).find(
          (item) => item.id === sheetState.categoryId,
        ) ?? null
      : null;
  const editorMode = sheetState?.mode ?? 'create';

  const openCreateSheet = useCallback(() => {
    setSheetState({ mode: 'create' });
  }, []);

  const openEditSheet = useCallback((category: CategoryItem, source: EditableSource) => {
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

  const handleEditPlaceholderPress = useCallback(() => {
    Alert.alert(
      'Edit button',
      'This temporary tile is only here as a visual placeholder for the separate edit entry.',
    );
  }, []);

  const closeSheet = useCallback(() => {
    setSheetState(null);
  }, []);

  const handleConfirmSheet = useCallback((payload: CategoryEditorPayload) => {
    if (!sheetState || sheetState.mode === 'create') {
      const nextCategory: CategoryItem = {
        colorValue: payload.colorValue,
        id: `custom-${Date.now()}`,
        iconKey: payload.iconKey,
        label: payload.label,
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
              colorValue: payload.colorValue,
              iconKey: payload.iconKey,
              label: payload.label,
            }
          : item,
      );

    if (sheetState.source === 'default') {
      setDefaultCategories(updater);
    } else {
      setCustomCategories(updater);
    }

    closeSheet();
  }, [closeSheet, sheetState]);

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

        <CategoryEditorSheet
          category={editedCategory}
          mode={editorMode}
          onClose={closeSheet}
          onConfirm={handleConfirmSheet}
          visible={sheetVisible}
        />
      </View>
    </>
  );
}

type CategorySectionProps = {
  items: CategoryItem[];
  onItemPress: (item: CategoryItem) => void;
  title: string;
};

const CategorySection = memo(function CategorySectionComponent({ items, onItemPress, title }: CategorySectionProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
});

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
  });
}
