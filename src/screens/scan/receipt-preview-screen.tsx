import {
  Cash01Icon,
  CreditCardIcon,
  Edit02Icon,
  Note01Icon,
  Payment01Icon,
  PencilEdit02Icon,
  ShoppingBag01Icon,
  Store04Icon,
} from '@hugeicons/core-free-icons';
import { AppIcon } from '@/shared/ui/icon';
import { memo, useCallback, useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/features/category/components/category-badge';
import { CategoryPickerSheet } from '@/features/category/components/category-picker-sheet';
import type { ExpenseCategory } from '@/features/category/model/category.types';
import { SegmentTabs } from '@/features/receipts/components/segment-tabs';
import { expenseCategorySeed } from '@/mock/category-data';
import { receiptPreviewSeed } from '@/mock/receipt-data';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';

import { ItemsEditDialog } from '../../features/receipts/components/items-edit-dialog';
import type { Receipt, ReceiptItem } from '../../features/receipts/model/receipt.types';
import {
  formatCurrency,
  getReceiptItemTotal,
  parseDecimalValue,
  recalculateReceipt,
  sanitizeCardLastFourInput,
  sanitizeCurrencyInput,
} from '../../features/receipts/receipt-item-utils';
import { AppTheme } from '@/shared/theme';

const footerHeight = 116;

type HugeIcon = typeof Store04Icon;
type PaymentMethod = 'cash' | 'card';
type TotalFieldKey = 'discount' | 'tax' | 'tips';
type EditableTotalsState = Record<TotalFieldKey, boolean>;

type ReceiptPreviewScreenProps = {
  onCancel?: () => void;
};

export function ReceiptPreviewScreen({ onCancel }: ReceiptPreviewScreenProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme, insets.top, insets.bottom);
  const availableCategories = expenseCategorySeed;
  const [receipt, setReceipt] = useState<Receipt>(() => recalculateReceipt(receiptPreviewSeed));
  const [isMerchantEditing, setIsMerchantEditing] = useState(false);
  const [isMerchantCategoryPickerVisible, setIsMerchantCategoryPickerVisible] = useState(false);
  const [isItemsDialogVisible, setIsItemsDialogVisible] = useState(false);
  const [editableTotals, setEditableTotals] = useState<EditableTotalsState>({
    tax: false,
    tips: false,
    discount: false,
  });

  const selectedCategory =
    receipt.category ??
    availableCategories.find((category) => category.id === receipt.categoryId) ??
    availableCategories[0];
  const paymentMethod = receipt.paymentMethodType === 'CASH' ? 'cash' : 'card';
  const subtotal = useMemo(() => parseDecimalValue(receipt.subtotalAmount), [receipt.subtotalAmount]);
  const totalAmount = useMemo(() => parseDecimalValue(receipt.totalAmount), [receipt.totalAmount]);
  const paymentMethodTabs = [
    { icon: Cash01Icon, label: 'Cash', value: 'cash' as const },
    { icon: CreditCardIcon, label: 'Card', value: 'card' as const },
  ];
  const receiptDateLabel = useMemo(() => formatReceiptDateDisplay(receipt.receiptDate), [receipt.receiptDate]);

  function updateReceipt(updater: (currentValue: Receipt) => Receipt) {
    setReceipt((currentValue) => recalculateReceipt(updater(currentValue)));
  }

  function handleMerchantFieldChange(field: 'address' | 'name' | 'phone', value: string) {
    updateReceipt((currentValue) => {
      if (field === 'name') {
        return {
          ...currentValue,
          merchantName: value,
          merchantNormalizedName: value.trim().toLowerCase(),
        };
      }

      if (field === 'phone') {
        return {
          ...currentValue,
          merchantPhone: value,
        };
      }

      return {
        ...currentValue,
        merchantAddress: value,
      };
    });
  }

  function handlePaymentMethodChange(nextValue: PaymentMethod) {
    updateReceipt((currentValue) => ({
      ...currentValue,
      paymentMethodType: nextValue === 'cash' ? 'CASH' : 'CARD',
      paymentMethodName: nextValue === 'cash' ? null : currentValue.paymentMethodName ?? '',
      paymentCardLast4: nextValue === 'cash' ? null : currentValue.paymentCardLast4 ?? '',
      paymentRawText:
        nextValue === 'cash'
          ? null
          : buildPaymentRawText(currentValue.paymentMethodName ?? '', currentValue.paymentCardLast4 ?? ''),
    }));
  }

  function handleCardFieldChange(field: 'lastFourDigits' | 'paymentMethodName', value: string) {
    updateReceipt((currentValue) => {
      if (field === 'lastFourDigits') {
        const nextLastFourDigits = sanitizeCardLastFourInput(value);

        return {
          ...currentValue,
          paymentCardLast4: nextLastFourDigits,
          paymentRawText: buildPaymentRawText(currentValue.paymentMethodName ?? '', nextLastFourDigits),
        };
      }

      return {
        ...currentValue,
        paymentMethodName: value,
        paymentRawText: buildPaymentRawText(value, currentValue.paymentCardLast4 ?? ''),
      };
    });
  }

  function handleTotalFieldChange(field: TotalFieldKey, value: string) {
    const nextValue = sanitizeCurrencyInput(value);

    updateReceipt((currentValue) => {
      if (field === 'tax') {
        return {
          ...currentValue,
          taxAmount: nextValue,
        };
      }

      if (field === 'tips') {
        return {
          ...currentValue,
          tipAmount: nextValue,
        };
      }

      return {
        ...currentValue,
        discountAmount: nextValue,
      };
    });
  }

  function handleEnableTotalEdit(field: TotalFieldKey) {
    setEditableTotals((currentValue) => {
      if (currentValue[field]) {
        return currentValue;
      }

      return {
        ...currentValue,
        [field]: true,
      };
    });
  }

  const handleOpenItemsDialog = useCallback(() => {
    setIsItemsDialogVisible(true);
  }, []);

  const handleCloseItemsDialog = useCallback(() => {
    setIsItemsDialogVisible(false);
  }, []);

  const handleSaveItemsDialog = useCallback((nextItems: ReceiptItem[]) => {
    updateReceipt((currentValue) => ({
      ...currentValue,
      items: nextItems,
    }));
    setIsItemsDialogVisible(false);
  }, []);

  function handleSelectMerchantCategory(category: ExpenseCategory) {
    updateReceipt((currentValue) => ({
      ...currentValue,
      category,
      categoryId: category.id,
    }));
    setIsMerchantCategoryPickerVisible(false);
  }

  return (
    <>
      <StatusBar barStyle='dark-content' />
      <View style={styles.screen}>
        <ScrollView
          contentInsetAdjustmentBehavior='automatic'
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <SectionCard>
            <View style={styles.merchantGlow} />
            <SectionHeader
              icon={Store04Icon}
              title='Merchant'
              trailing={
                <SectionEditButton
                  disabled={isMerchantEditing}
                  label='Edit'
                  onPress={() => setIsMerchantEditing(true)}
                />
              }
            />

            {isMerchantEditing ? (
              <View style={styles.sectionBody}>
                <View style={styles.merchantNameInputRow}>
                  <View style={styles.merchantBadgeColumn}>
                    <CategoryBadge
                      category={selectedCategory}
                      onPress={() => setIsMerchantCategoryPickerVisible(true)}
                    />
                    <Text style={styles.badgeHintText}>Tap to change</Text>
                  </View>
                  <View style={styles.merchantNameInputColumn}>
                    <Text style={styles.fieldLabel}>NAME</Text>
                    <ReceiptInput
                      value={receipt.merchantName}
                      onChangeText={(value) => handleMerchantFieldChange('name', value)}
                      placeholder='Merchant name'
                    />
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <View style={styles.columnField}>
                    <Text style={styles.fieldLabel}>PHONE</Text>
                    <ReceiptInput
                      value={receipt.merchantPhone ?? ''}
                      onChangeText={(value) => handleMerchantFieldChange('phone', value)}
                      placeholder='Phone'
                    />
                  </View>

                  <View style={styles.columnField}>
                    <Text style={styles.fieldLabel}>DATE</Text>
                    <MerchantDateField value={receiptDateLabel} onPress={() => {}} />
                  </View>
                </View>

                <View style={styles.fullWidthField}>
                  <Text style={styles.fieldLabel}>ADDRESS</Text>
                  <ReceiptInput
                    value={receipt.merchantAddress ?? ''}
                    onChangeText={(value) => handleMerchantFieldChange('address', value)}
                    placeholder='Address'
                    multiline
                  />
                </View>
              </View>
            ) : (
              <View style={styles.sectionBody}>
                <View style={styles.merchantIdentityRow}>
                  <CategoryBadge category={selectedCategory} />
                  <View style={styles.merchantIdentityText}>
                    <Text style={styles.fieldLabel}>NAME</Text>
                    <Text style={styles.fieldValue}>{receipt.merchantName}</Text>
                    <Text style={styles.merchantCategoryValue}>{selectedCategory.name}</Text>
                  </View>
                </View>

                <View style={styles.twoColumnRow}>
                  <DisplayField label='PHONE' value={receipt.merchantPhone ?? ''} />
                  <DisplayField label='DATE' value={receiptDateLabel} />
                </View>

                <DisplayField label='ADDRESS' value={receipt.merchantAddress ?? ''} />
              </View>
            )}
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={ShoppingBag01Icon}
              title='Items'
              trailing={<SectionEditButton label='Edit' onPress={handleOpenItemsDialog} />}
            />

            <View style={styles.sectionBody}>
              <View style={styles.itemsHeaderRow}>
                <View style={styles.itemNameColumn}>
                  <Text style={styles.tableHeaderText}>NAME</Text>
                </View>
                <View style={styles.itemQuantityColumn}>
                  <Text style={[styles.tableHeaderText, styles.tableHeaderCentered]}>QTY</Text>
                </View>
                <View style={styles.itemPriceColumn}>
                  <Text style={[styles.tableHeaderText, styles.tableHeaderCentered]}>PRICE</Text>
                </View>
                <View style={styles.itemTotalColumn}>
                  <Text style={[styles.tableHeaderText, styles.tableHeaderAlignedRight]}>TOTAL</Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {receipt.items.map((item, index) => (
                  <View
                    key={`${item.sortOrder}-${item.name}`}
                    style={[styles.itemRow, index !== receipt.items.length - 1 ? styles.itemRowDivider : null]}
                  >
                    <View style={styles.itemNameColumn}>
                      <Text style={styles.itemValueText}>{item.name}</Text>
                    </View>
                    <View style={styles.itemQuantityColumn}>
                      <Text style={[styles.itemValueText, styles.itemValueCentered]}>{item.quantity || '0'}</Text>
                    </View>
                    <View style={styles.itemPriceColumn}>
                      <Text style={[styles.itemValueText, styles.itemValueCentered]}>
                        {formatCurrency(parseDecimalValue(item.unitPrice), receipt.currency)}
                      </Text>
                    </View>
                    <View style={styles.itemTotalColumn}>
                      <Text style={[styles.itemValueText, styles.itemValueAlignedRight]}>
                        {formatCurrency(getReceiptItemTotal(item), receipt.currency)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              icon={Payment01Icon}
              title='Payment Method'
              trailing={
                <View style={styles.paymentMethodTabsWrap}>
                  <SegmentTabs
                    items={paymentMethodTabs}
                    selectedValue={paymentMethod}
                    onChange={handlePaymentMethodChange}
                  />
                </View>
              }
            />

            {paymentMethod === 'card' ? (
              <View style={styles.paymentInputsRow}>
                <View style={styles.columnField}>
                  <Text style={styles.fieldLabel}>PAYMENT NAME</Text>
                  <ReceiptInput
                    value={receipt.paymentMethodName ?? ''}
                    onChangeText={(value) => handleCardFieldChange('paymentMethodName', value)}
                    placeholder='e.g. VISA'
                  />
                </View>

                <View style={styles.columnField}>
                  <Text style={styles.fieldLabel}>LAST 4 DIGITS</Text>
                  <ReceiptInput
                    value={receipt.paymentCardLast4 ?? ''}
                    onChangeText={(value) => handleCardFieldChange('lastFourDigits', value)}
                    placeholder='Last 4 digits'
                    keyboardType='number-pad'
                  />
                </View>
              </View>
            ) : null}
          </SectionCard>

          <SectionCard>
            <SectionHeader icon={Note01Icon} title='Note' />

            <View style={styles.sectionBody}>
              <ReceiptInput
                value={receipt.note ?? ''}
                onChangeText={(value) =>
                  updateReceipt((currentValue) => ({
                    ...currentValue,
                    note: value,
                  }))
                }
                placeholder='Write a note'
                multiline
              />
            </View>
          </SectionCard>

          <SectionCard>
            <View style={styles.totalsRows}>
              <EditableTotalRow
                isEditing={editableTotals.tax}
                label='Tax'
                value={receipt.taxAmount}
                currencyCode={receipt.currency}
                onChangeText={(value) => handleTotalFieldChange('tax', value)}
                onEdit={() => handleEnableTotalEdit('tax')}
              />
              <EditableTotalRow
                isEditing={editableTotals.tips}
                label='Tips'
                value={receipt.tipAmount}
                currencyCode={receipt.currency}
                onChangeText={(value) => handleTotalFieldChange('tips', value)}
                onEdit={() => handleEnableTotalEdit('tips')}
              />
              <EditableTotalRow
                isEditing={editableTotals.discount}
                label='Discount'
                value={receipt.discountAmount}
                currencyCode={receipt.currency}
                onChangeText={(value) => handleTotalFieldChange('discount', value)}
                onEdit={() => handleEnableTotalEdit('discount')}
                isNegative
              />
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.amountSummaryRow}>
              <View>
                <Text style={styles.amountSummaryLabel}>TOTAL AMOUNT</Text>
                <Text style={styles.totalAmountValue}>{formatCurrency(totalAmount, receipt.currency)}</Text>
              </View>

              <View style={styles.subtotalSummaryBlock}>
                <Text style={styles.amountSummaryLabel}>SUBTOTAL</Text>
                <Text style={styles.subtotalAmountValue}>{formatCurrency(subtotal, receipt.currency)}</Text>
              </View>
            </View>
          </SectionCard>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={onCancel} style={styles.footerSecondaryPressable}>
            {({ pressed }) => (
              <View style={[styles.footerSecondaryButton, pressed ? styles.footerSecondaryButtonPressed : null]}>
                <Text style={styles.footerSecondaryLabel}>Cancel</Text>
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => {}} style={styles.footerPrimaryPressable}>
            {({ pressed }) => (
              <View style={[styles.footerPrimaryButton, pressed ? styles.footerPrimaryButtonPressed : null]}>
                <Text style={styles.footerPrimaryLabel}>Confirm & Add</Text>
              </View>
            )}
          </Pressable>
        </View>

        <ItemsEditDialog
          items={receipt.items}
          isVisible={isItemsDialogVisible}
          onClose={handleCloseItemsDialog}
          onSave={handleSaveItemsDialog}
        />

        <CategoryPickerSheet
          categories={availableCategories}
          isVisible={isMerchantCategoryPickerVisible}
          onClose={() => setIsMerchantCategoryPickerVisible(false)}
          onSelect={handleSelectMerchantCategory}
          selectedCategoryId={selectedCategory.id}
        />
      </View>
    </>
  );
}

type SectionCardProps = {
  children: ReactNode;
};

const SectionCard = memo(function SectionCardComponent({ children }: SectionCardProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return <View style={styles.sectionCard}>{children}</View>;
});

type SectionHeaderProps = {
  icon: HugeIcon;
  title: string;
  trailing?: ReactNode;
};

const SectionHeader = memo(function SectionHeaderComponent({ icon, title, trailing }: SectionHeaderProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <AppIcon icon={icon} color={theme.colors.secondary} size={22} strokeWidth={1.9} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {trailing ? <View style={styles.sectionHeaderTrailing}>{trailing}</View> : null}
    </View>
  );
});

type SectionEditButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

const SectionEditButton = memo(function SectionEditButtonComponent({
  disabled = false,
  label,
  onPress,
}: SectionEditButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.sectionEditPressable}>
      {({ pressed }) => (
        <View
          style={[
            styles.sectionEditButton,
            disabled ? styles.sectionEditButtonDisabled : null,
            pressed && !disabled ? styles.sectionEditButtonPressed : null,
          ]}
        >
          <AppIcon
            icon={Edit02Icon}
            color={disabled ? theme.colors.textHint : theme.colors.secondary}
            size={14}
            strokeWidth={1.9}
          />
          <Text style={[styles.sectionEditLabel, disabled ? styles.sectionEditLabelDisabled : null]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
});

type MerchantDateFieldProps = {
  onPress: () => void;
  value: string;
};

const MerchantDateField = memo(function MerchantDateFieldComponent({ onPress, value }: MerchantDateFieldProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <Pressable onPress={onPress} style={styles.dateFieldPressable}>
      {({ pressed }) => (
        <View style={[styles.dateField, pressed ? styles.dateFieldPressed : null]}>
          <Text style={styles.dateFieldValue}>{value}</Text>
          <AppIcon icon={PencilEdit02Icon} color={theme.colors.secondary} size={16} strokeWidth={1.8} />
        </View>
      )}
    </Pressable>
  );
});

type DisplayFieldProps = {
  label: string;
  value: string;
};

const DisplayField = memo(function DisplayFieldComponent({ label, value }: DisplayFieldProps) {
  const styles = createStyles(useAppTheme(), 0, 0);

  return (
    <View style={styles.displayField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
});

type ReceiptInputProps = {
  keyboardType?: 'decimal-pad' | 'default' | 'number-pad';
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

const ReceiptInput = memo(function ReceiptInputComponent({
  keyboardType = 'default',
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: ReceiptInputProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textHint}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.receiptInput, multiline ? styles.receiptInputMultiline : null]}
    />
  );
});

type EditableTotalRowProps = {
  currencyCode: Receipt['currency'];
  isEditing: boolean;
  isNegative?: boolean;
  label: string;
  onChangeText: (value: string) => void;
  onEdit: () => void;
  value: string;
};

const EditableTotalRow = memo(function EditableTotalRowComponent({
  currencyCode,
  isEditing,
  isNegative = false,
  label,
  onChangeText,
  onEdit,
  value,
}: EditableTotalRowProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, 0, 0);
  const formattedValue = isNegative
    ? `-${formatCurrency(parseDecimalValue(value), currencyCode)}`
    : formatCurrency(parseDecimalValue(value), currencyCode);

  return (
    <View style={styles.totalRow}>
      <Text style={styles.totalRowLabel}>{label}</Text>

      {isEditing ? (
        <View style={styles.totalInputWrapper}>
          <Text style={styles.totalInputPrefix}>{isNegative ? '-$' : '$'}</Text>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType='decimal-pad'
            textAlign='right'
            placeholder='0.00'
            placeholderTextColor={theme.colors.textHint}
            style={styles.totalInput}
          />
        </View>
      ) : (
        <View style={styles.totalDisplay}>
          <Text style={styles.totalValueText}>{formattedValue}</Text>
          <Pressable onPress={onEdit} style={styles.totalEditPressable}>
            {({ pressed }) => (
              <View style={pressed ? styles.totalEditPressed : null}>
                <AppIcon icon={PencilEdit02Icon} color={theme.colors.secondary} size={16} strokeWidth={1.9} />
              </View>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
});

function buildPaymentRawText(paymentMethodName: string, lastFourDigits: string) {
  const trimmedPaymentMethodName = paymentMethodName.trim();
  const trimmedLastFourDigits = sanitizeCardLastFourInput(lastFourDigits);

  if (!trimmedPaymentMethodName && !trimmedLastFourDigits) {
    return null;
  }

  if (!trimmedLastFourDigits) {
    return trimmedPaymentMethodName || null;
  }

  if (!trimmedPaymentMethodName) {
    return `•••• ${trimmedLastFourDigits}`;
  }

  return `${trimmedPaymentMethodName} •••• ${trimmedLastFourDigits}`;
}

function formatReceiptDateDisplay(receiptDate: string) {
  const parsedDate = new Date(receiptDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return receiptDate;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

function createStyles(theme: AppTheme, topInset: number, bottomInset: number) {
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
      paddingBottom: footerHeight + bottomInset + spacing.xl,
      paddingLeft: spacing.lg,
      gap: spacing.md,
    },
    draftBadge: {
      minWidth: 56,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
      alignItems: 'center',
    },
    draftBadgeText: {
      ...typography.labelLarge,
      color: theme.colors.textSecondary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    sectionCard: {
      overflow: 'hidden',
      padding: spacing.md,
      borderRadius: radius.xl,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: 'rgba(225, 227, 228, 0.9)',
      backgroundColor: theme.colors.surface,
      gap: spacing.md,
    },
    merchantGlow: {
      position: 'absolute',
      top: -52,
      right: -36,
      width: 168,
      height: 168,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(245, 124, 0, 0.08)',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flexShrink: 1,
    },
    sectionTitle: {
      ...typography.titleLarge,
      color: theme.colors.textSecondary,
      flexShrink: 1,
    },
    sectionHeaderTrailing: {
      marginLeft: spacing.sm,
    },
    paymentMethodTabsWrap: {
      width: 150,
    },
    sectionEditPressable: {
      borderRadius: radius.md,
    },
    sectionEditButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
      borderRadius: radius.md,
      borderCurve: 'continuous',
    },
    sectionEditButtonDisabled: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    sectionEditButtonPressed: {
      opacity: 0.84,
    },
    sectionEditLabel: {
      ...typography.labelLarge,
      color: theme.colors.secondary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    sectionEditLabelDisabled: {
      color: theme.colors.textHint,
    },
    sectionBody: {
      gap: spacing.md,
    },
    merchantIdentityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    merchantIdentityText: {
      flex: 1,
      gap: spacing.xxs,
    },
    merchantCategoryValue: {
      ...typography.bodyMedium,
      color: theme.colors.textTertiary,
    },
    merchantNameInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    merchantBadgeColumn: {
      alignItems: 'center',
      gap: spacing.xxs,
    },
    merchantNameInputColumn: {
      flex: 1,
      gap: spacing.xxs,
    },
    badgeHintText: {
      ...typography.labelLarge,
      color: theme.colors.textHint,
    },
    dateFieldPressable: {
      borderRadius: radius.md,
    },
    dateField: {
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
      gap: spacing.sm,
    },
    dateFieldPressed: {
      opacity: 0.9,
    },
    dateFieldValue: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    twoColumnRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    columnField: {
      flex: 1,
      gap: spacing.xxs,
    },
    fullWidthField: {
      gap: spacing.xxs,
    },
    displayField: {
      flex: 1,
      gap: spacing.xxs,
    },
    fieldLabel: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.5,
    },
    fieldValue: {
      ...typography.bodyLarge,
      color: theme.colors.textSecondary,
    },
    receiptInput: {
      minHeight: 36,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.textSecondary,
      ...typography.bodyLarge,
    },
    receiptInputMultiline: {
      minHeight: 92,
    },
    itemsHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    tableHeaderText: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.5,
    },
    tableHeaderCentered: {
      textAlign: 'center',
    },
    tableHeaderAlignedRight: {
      textAlign: 'right',
    },
    itemsList: {
      borderTopWidth: 1,
      borderTopColor: 'rgba(225, 227, 228, 0.7)',
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
    },
    itemRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(225, 227, 228, 0.7)',
    },
    itemNameColumn: {
      flex: 1.7,
    },
    itemQuantityColumn: {
      flex: 0.7,
    },
    itemPriceColumn: {
      flex: 1,
    },
    itemTotalColumn: {
      flex: 1,
    },
    itemValueText: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    itemValueCentered: {
      textAlign: 'center',
    },
    itemValueAlignedRight: {
      textAlign: 'right',
    },
    paymentInputsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    totalsRows: {
      gap: spacing.md,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    totalRowLabel: {
      ...typography.bodyLarge,
      color: theme.colors.textTertiary,
    },
    totalDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    totalValueText: {
      ...typography.titleMedium,
      color: theme.colors.textTertiary,
    },
    totalEditPressable: {
      borderRadius: radius.sm,
    },
    totalEditPressed: {
      opacity: 0.84,
    },
    totalInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 126,
      maxWidth: 148,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.surfaceAlt,
    },
    totalInputPrefix: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    totalInput: {
      flex: 1,
      minHeight: 40,
      color: theme.colors.textSecondary,
      ...typography.titleMedium,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: 'rgba(225, 227, 228, 0.95)',
    },
    amountSummaryRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    amountSummaryLabel: {
      ...typography.labelLarge,
      color: theme.colors.textTertiary,
      letterSpacing: 0.5,
    },
    totalAmountValue: {
      ...typography.displayLarge,
      color: theme.colors.secondary,
      marginTop: spacing.xxs,
    },
    subtotalSummaryBlock: {
      alignItems: 'flex-end',
    },
    subtotalAmountValue: {
      ...typography.headlineMedium,
      color: theme.colors.textSecondary,
      marginTop: spacing.xxs,
    },
    footer: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      left: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingTop: spacing.md,
      paddingRight: spacing.lg,
      paddingBottom: bottomInset > 0 ? bottomInset + spacing.sm : spacing.md,
      paddingLeft: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: 'rgba(225, 227, 228, 0.9)',
      backgroundColor: 'rgba(253, 253, 248, 0.98)',
    },
    footerSecondaryPressable: {
      flex: 1,
      borderRadius: radius.lg,
    },
    footerSecondaryButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1.5,
      borderColor: theme.colors.secondary,
      backgroundColor: theme.colors.surface,
    },
    footerSecondaryButtonPressed: {
      opacity: 0.9,
    },
    footerSecondaryLabel: {
      ...typography.titleMedium,
      color: theme.colors.secondary,
    },
    footerPrimaryPressable: {
      flex: 1.7,
      borderRadius: radius.lg,
    },
    footerPrimaryButton: {
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
      boxShadow: theme.shadow.accent,
    },
    footerPrimaryButtonPressed: {
      opacity: 0.92,
    },
    footerPrimaryLabel: {
      ...typography.titleMedium,
      color: staticColors.white,
    },
  });
}
