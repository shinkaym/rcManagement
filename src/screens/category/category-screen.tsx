import { Settings02Icon } from '@hugeicons/core-free-icons';
import { memo, useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { ActionCard } from '@/features/category/components/action-card';
import { CategoryCard } from '@/features/category/components/category-card';
import { CategoryEditorSheet, type CategoryEditorPayload } from '@/features/category/components/category-editor-sheet';
import type { ExpenseCategory } from '@/features/category/model/category.types';
import { navigationMetrics } from '@/navigation/navigation-metrics';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

import { expenseCategorySeed } from '../../mock/category-data';
import { AppTheme } from '@/shared/theme';

const addImageSource = require('../../../assets/images/add.png');

type SheetState = { mode: 'create' } | { categoryId: string; mode: 'edit' };

export function CategoryScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [categories, setCategories] = useState<ExpenseCategory[]>(expenseCategorySeed);
  const [sheetState, setSheetState] = useState<SheetState | null>(null);

  const sheetVisible = sheetState !== null;
  const activeCategories = useMemo(() => categories.filter((category) => category.isActive), [categories]);
  const defaultCategories = useMemo(
    () => activeCategories.filter((category) => category.isDefault),
    [activeCategories],
  );
  const customCategories = useMemo(
    () => activeCategories.filter((category) => !category.isDefault),
    [activeCategories],
  );
  const editedCategory =
    sheetState?.mode === 'edit'
      ? categories.find((category) => category.id === sheetState.categoryId) ?? null
      : null;
  const editorMode = sheetState?.mode ?? 'create';

  const openCreateSheet = useCallback(() => {
    setSheetState({ mode: 'create' });
  }, []);

  const openEditSheet = useCallback((category: ExpenseCategory) => {
    if (category.isDefault) {
      return;
    }

    setSheetState({
      mode: 'edit',
      categoryId: category.id,
    });
  }, []);

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
      const now = new Date().toISOString();
      const nextCategory: ExpenseCategory = {
        code: null,
        color: payload.color,
        createdAt: now,
        id: `custom-${Date.now()}`,
        icon: payload.icon,
        isActive: true,
        isDefault: false,
        name: payload.name,
        updatedAt: now,
      };

      setCategories((current) => [...current, nextCategory]);
      closeSheet();
      return;
    }

    setCategories((current) =>
      current.map((category) =>
        category.id === sheetState.categoryId
          ? {
              ...category,
              color: payload.color,
              icon: payload.icon,
              name: payload.name,
              updatedAt: new Date().toISOString(),
            }
          : category,
      ),
    );

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
              itemDisabled
            />

            <View style={styles.sectionSpacer}>
              <Text style={styles.sectionTitle}>Custom List</Text>
              <View style={styles.grid}>
                {customCategories.map((item) => (
                  <CategoryCard key={item.id} item={item} onPressItem={openEditSheet} />
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
  itemDisabled?: boolean;
  items: ExpenseCategory[];
  onItemPress?: (item: ExpenseCategory) => void;
  title: string;
};

const CategorySection = memo(function CategorySectionComponent({
  itemDisabled = false,
  items,
  onItemPress,
  title,
}: CategorySectionProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <CategoryCard disabled={itemDisabled} key={item.id} item={item} onPressItem={onItemPress} />
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
