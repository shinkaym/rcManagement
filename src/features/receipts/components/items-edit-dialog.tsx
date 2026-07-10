import { Add01Icon, ArrowDown01Icon, ArrowUp01Icon, Cancel01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { AppIcon } from '@/shared/ui/icon';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';

import {
  createEmptyReceiptItem,
  formatCurrency,
  getReceiptItemTotal,
  moveItemByDirection,
  sanitizeCurrencyInput,
  sanitizeIntegerInput,
} from '../receipt-item-utils';
import type { ReceiptItemState } from '../receipt-types';
import { AppTheme } from '@/shared/theme';

type HugeIcon = typeof Cancel01Icon;
type ReceiptItemEditableField = keyof Pick<ReceiptItemState, 'name' | 'price' | 'quantity'>;

type ItemsEditDialogProps = {
  isVisible: boolean;
  items: ReceiptItemState[];
  onClose: () => void;
  onSave: (items: ReceiptItemState[]) => void;
};

export const ItemsEditDialog = memo(function ItemsEditDialogComponent({
  isVisible,
  items,
  onClose,
  onSave,
}: ItemsEditDialogProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets.bottom), [insets.bottom, theme]);
  const [draftItems, setDraftItems] = useState<ReceiptItemState[]>(items);

  useEffect(() => {
    if (isVisible) {
      setDraftItems(items.map((item) => ({ ...item })));
    }
  }, [isVisible, items]);

  const handleAddItem = useCallback(() => {
    setDraftItems((currentValue) => [...currentValue, createEmptyReceiptItem()]);
  }, []);

  const handleChangeItem = useCallback((itemId: string, field: ReceiptItemEditableField, value: string) => {
    setDraftItems((currentValue) =>
      currentValue.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        if (field === 'quantity') {
          return {
            ...item,
            quantity: sanitizeIntegerInput(value),
          };
        }

        if (field === 'price') {
          return {
            ...item,
            price: sanitizeCurrencyInput(value),
          };
        }

        return {
          ...item,
          name: value,
        };
      }),
    );
  }, []);

  const handleDeleteItem = useCallback((itemId: string) => {
    setDraftItems((currentValue) => currentValue.filter((item) => item.id !== itemId));
  }, []);

  const handleMoveItem = useCallback((itemId: string, direction: 'down' | 'up') => {
    setDraftItems((currentValue) => moveItemByDirection(currentValue, itemId, direction));
  }, []);

  const handleSave = useCallback(() => {
    const sanitizedItems = draftItems.map((item) => ({
      ...item,
      name: item.name.trim() || 'Untitled item',
      quantity: sanitizeIntegerInput(item.quantity) || '0',
      price: sanitizeCurrencyInput(item.price) || '0',
    }));

    onSave(sanitizedItems);
  }, [draftItems, onSave]);

  const keyExtractor = useCallback((item: ReceiptItemState) => item.id, []);

  const renderItem = useCallback(
    ({ index, item }: ListRenderItemInfo<ReceiptItemState>) => (
      <DialogItemRow
        index={index}
        item={item}
        itemCount={draftItems.length}
        onChangeItem={handleChangeItem}
        onDeleteItem={handleDeleteItem}
        onMoveItem={handleMoveItem}
        styles={styles}
      />
    ),
    [draftItems.length, handleChangeItem, handleDeleteItem, handleMoveItem, styles],
  );

  return (
    <Modal transparent animationType='fade' visible={isVisible} onRequestClose={onClose}>
      <View style={styles.dialogBackdrop}>
        <Pressable style={styles.dialogBackdropPressable} onPress={onClose} />

        <View style={styles.dialogCard}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogTitleBlock}>
              <Text style={styles.dialogTitle}>Edit Items</Text>
              <Text style={styles.dialogSubtitle}>
                Edit each item as a mobile card so long lists stay smooth and easy to tap.
              </Text>
            </View>

            <DialogSurfaceIconButton icon={Cancel01Icon} onPress={onClose} styles={styles} />
          </View>

          <Pressable onPress={handleAddItem} style={styles.addItemPressable}>
            {({ pressed }) => (
              <View style={[styles.addItemButton, pressed ? styles.addItemButtonPressed : null]}>
                <AppIcon icon={Add01Icon} color={staticColors.white} size={18} strokeWidth={1.9} />
                <Text style={styles.addItemLabel}>Add Item</Text>
              </View>
            )}
          </Pressable>

          <FlatList
            data={draftItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
            style={styles.dialogList}
            contentContainerStyle={styles.dialogListContent}
          />

          <View style={styles.dialogFooter}>
            <Pressable onPress={onClose} style={styles.dialogFooterSecondaryPressable}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.dialogFooterSecondaryButton,
                    pressed ? styles.dialogFooterSecondaryButtonPressed : null,
                  ]}
                >
                  <Text style={styles.dialogFooterSecondaryLabel}>Cancel</Text>
                </View>
              )}
            </Pressable>

            <Pressable onPress={handleSave} style={styles.dialogFooterPrimaryPressable}>
              {({ pressed }) => (
                <View
                  style={[styles.dialogFooterPrimaryButton, pressed ? styles.dialogFooterPrimaryButtonPressed : null]}
                >
                  <Text style={styles.dialogFooterPrimaryLabel}>Save Items</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

type DialogItemRowProps = {
  index: number;
  item: ReceiptItemState;
  itemCount: number;
  onChangeItem: (itemId: string, field: ReceiptItemEditableField, value: string) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItem: (itemId: string, direction: 'down' | 'up') => void;
  styles: ReturnType<typeof createStyles>;
};

const DialogItemRow = memo(function DialogItemRowComponent({
  index,
  item,
  itemCount,
  onChangeItem,
  onDeleteItem,
  onMoveItem,
  styles,
}: DialogItemRowProps) {
  const handleChangeName = useCallback((value: string) => onChangeItem(item.id, 'name', value), [item.id, onChangeItem]);
  const handleChangeQuantity = useCallback(
    (value: string) => onChangeItem(item.id, 'quantity', value),
    [item.id, onChangeItem],
  );
  const handleChangePrice = useCallback(
    (value: string) => onChangeItem(item.id, 'price', value),
    [item.id, onChangeItem],
  );
  const handleMoveUp = useCallback(() => onMoveItem(item.id, 'up'), [item.id, onMoveItem]);
  const handleMoveDown = useCallback(() => onMoveItem(item.id, 'down'), [item.id, onMoveItem]);
  const handleDelete = useCallback(() => onDeleteItem(item.id), [item.id, onDeleteItem]);

  return (
    <View style={styles.dialogItemCard}>
      <View style={styles.dialogItemHeader}>
        <View style={styles.dialogItemTitleBlock}>
          <Text style={styles.dialogItemIndex}>ITEM {index + 1}</Text>
          <Text numberOfLines={1} style={styles.dialogItemNamePreview}>
            {item.name.trim() || 'Untitled item'}
          </Text>
        </View>

        <View style={styles.dialogItemTotalPill}>
          <Text style={styles.dialogItemTotalLabel}>TOTAL</Text>
          <Text style={styles.dialogItemTotalText}>{formatCurrency(getReceiptItemTotal(item))}</Text>
        </View>
      </View>

      <View style={styles.dialogFieldGroup}>
        <Text style={styles.dialogFieldLabel}>NAME</Text>
        <DialogInput value={item.name} onChangeText={handleChangeName} placeholder='Item name' styles={styles} />
      </View>

      <View style={styles.dialogInlineFields}>
        <View style={styles.dialogInlineField}>
          <Text style={styles.dialogFieldLabel}>QTY</Text>
          <DialogInput
            value={item.quantity}
            onChangeText={handleChangeQuantity}
            placeholder='0'
            keyboardType='number-pad'
            textAlign='center'
            styles={styles}
          />
        </View>

        <View style={styles.dialogInlineField}>
          <Text style={styles.dialogFieldLabel}>PRICE</Text>
          <DialogInput
            value={item.price}
            onChangeText={handleChangePrice}
            placeholder='0.00'
            keyboardType='decimal-pad'
            textAlign='center'
            styles={styles}
          />
        </View>
      </View>

      <View style={styles.dialogItemActions}>
        <IconMiniButton disabled={index === 0} icon={ArrowUp01Icon} onPress={handleMoveUp} styles={styles} />
        <IconMiniButton
          disabled={index === itemCount - 1}
          icon={ArrowDown01Icon}
          onPress={handleMoveDown}
          styles={styles}
        />
        <IconMiniButton destructive disabled={itemCount <= 1} icon={Delete02Icon} onPress={handleDelete} styles={styles} />
      </View>
    </View>
  );
});

type DialogInputProps = {
  keyboardType?: 'decimal-pad' | 'default' | 'number-pad';
  onChangeText: (value: string) => void;
  placeholder: string;
  styles: ReturnType<typeof createStyles>;
  textAlign?: 'center' | 'left' | 'right';
  value: string;
};

const DialogInput = memo(function DialogInputComponent({
  keyboardType = 'default',
  onChangeText,
  placeholder,
  styles,
  textAlign = 'left',
  value,
}: DialogInputProps) {
  const theme = useAppTheme();

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textHint}
      textAlign={textAlign}
      style={styles.dialogInput}
    />
  );
});

type DialogSurfaceIconButtonProps = {
  icon: HugeIcon;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
};

const DialogSurfaceIconButton = memo(function DialogSurfaceIconButtonComponent({
  icon,
  onPress,
  styles,
}: DialogSurfaceIconButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable onPress={onPress} style={styles.surfaceIconPressable}>
      {({ pressed }) => (
        <View style={[styles.surfaceIconButton, pressed ? styles.surfaceIconButtonPressed : null]}>
          <AppIcon icon={icon} color={theme.colors.primary} size={20} strokeWidth={2} />
        </View>
      )}
    </Pressable>
  );
});

type IconMiniButtonProps = {
  destructive?: boolean;
  disabled?: boolean;
  icon: HugeIcon;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
};

const IconMiniButton = memo(function IconMiniButtonComponent({
  destructive = false,
  disabled = false,
  icon,
  onPress,
  styles,
}: IconMiniButtonProps) {
  const theme = useAppTheme();
  const color = destructive ? theme.colors.danger : theme.colors.secondary;

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.iconMiniPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.iconMiniButton,
            disabled ? styles.iconMiniButtonDisabled : null,
            pressed && !disabled ? styles.iconMiniButtonPressed : null,
          ]}
        >
          <AppIcon icon={icon} color={disabled ? theme.colors.textHint : color} size={14} strokeWidth={1.9} />
        </View>
      )}
    </Pressable>
  );
});

function createStyles(theme: AppTheme, bottomInset: number) {
  return StyleSheet.create({
    dialogBackdrop: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      backgroundColor: 'rgba(17, 24, 39, 0.38)',
    },
    dialogBackdropPressable: {
      ...StyleSheet.absoluteFill,
    },
    dialogCard: {
      maxHeight: '90%',
      borderRadius: radius.xl,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surface,
      padding: spacing.lg,
      boxShadow: theme.shadow.dialog,
      gap: spacing.md,
    },
    dialogHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    dialogTitleBlock: {
      flex: 1,
    },
    dialogTitle: {
      ...typography.headlineMedium,
      color: theme.colors.textSecondary,
    },
    dialogSubtitle: {
      ...typography.bodyMedium,
      color: theme.colors.textTertiary,
      marginTop: spacing.xxs,
    },
    surfaceIconPressable: {
      borderRadius: radius.pill,
    },
    surfaceIconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: theme.colors.surface,
      boxShadow: theme.shadow.button,
    },
    surfaceIconButtonPressed: {
      opacity: 0.9,
    },
    addItemPressable: {
      alignSelf: 'flex-start',
      borderRadius: radius.lg,
    },
    addItemButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
    },
    addItemButtonPressed: {
      opacity: 0.9,
    },
    addItemLabel: {
      ...typography.titleMedium,
      color: staticColors.white,
    },
    dialogList: {
      maxHeight: 420,
    },
    dialogListContent: {
      gap: spacing.sm,
      paddingBottom: spacing.xs,
    },
    dialogItemCard: {
      padding: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      gap: spacing.sm,
    },
    dialogItemHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    dialogItemTitleBlock: {
      flex: 1,
    },
    dialogItemIndex: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.5,
    },
    dialogItemNamePreview: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    dialogItemTotalPill: {
      minWidth: 94,
      alignItems: 'flex-end',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(245, 124, 0, 0.10)',
    },
    dialogItemTotalLabel: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.4,
    },
    dialogItemTotalText: {
      ...typography.titleMedium,
      color: theme.colors.secondary,
      marginTop: 1,
    },
    dialogFieldGroup: {
      gap: spacing.xxs,
    },
    dialogFieldLabel: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.4,
    },
    dialogInlineFields: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    dialogInlineField: {
      flex: 1,
      gap: spacing.xxs,
    },
    dialogInput: {
      minHeight: 44,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.textSecondary,
      ...typography.bodyMedium,
    },
    dialogItemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.xs,
    },
    iconMiniPressable: {
      borderRadius: radius.sm,
    },
    iconMiniButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
    },
    iconMiniButtonDisabled: {
      opacity: 0.45,
    },
    iconMiniButtonPressed: {
      opacity: 0.84,
    },
    dialogFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.xs,
      paddingBottom: bottomInset > 0 ? bottomInset : 0,
    },
    dialogFooterSecondaryPressable: {
      flex: 1,
      borderRadius: radius.lg,
    },
    dialogFooterSecondaryButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1.5,
      borderColor: theme.colors.secondary,
      backgroundColor: theme.colors.surface,
    },
    dialogFooterSecondaryButtonPressed: {
      opacity: 0.9,
    },
    dialogFooterSecondaryLabel: {
      ...typography.titleMedium,
      color: theme.colors.secondary,
    },
    dialogFooterPrimaryPressable: {
      flex: 1.6,
      borderRadius: radius.lg,
    },
    dialogFooterPrimaryButton: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
      boxShadow: theme.shadow.accentMuted,
    },
    dialogFooterPrimaryButtonPressed: {
      opacity: 0.92,
    },
    dialogFooterPrimaryLabel: {
      ...typography.titleMedium,
      color: staticColors.white,
    },
  });
}
