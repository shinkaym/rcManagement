import type { CurrencyCode } from '@/shared/model/common.types';

import type { Receipt, ReceiptItem } from './model/receipt.types';

export function parseDecimalValue(value: string | null | undefined) {
  const normalizedValue = Number.parseFloat((value ?? '').replace(/[^0-9.]/g, ''));

  return Number.isFinite(normalizedValue) ? normalizedValue : 0;
}

export function formatCurrency(value: number, currencyCode: CurrencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMoneyDecimal(value: number) {
  return value.toFixed(2);
}

export function sanitizeDecimalInput(value: string) {
  const sanitizedValue = value.replace(/[^0-9.]/g, '');
  const firstDotIndex = sanitizedValue.indexOf('.');

  if (firstDotIndex === -1) {
    return sanitizedValue;
  }

  const head = sanitizedValue.slice(0, firstDotIndex + 1);
  const tail = sanitizedValue.slice(firstDotIndex + 1).replace(/\./g, '');

  return `${head}${tail}`;
}

export function sanitizeCurrencyInput(value: string) {
  return sanitizeDecimalInput(value);
}

export function sanitizeCardLastFourInput(value: string) {
  return value.replace(/[^0-9]/g, '').slice(0, 4);
}

export function getReceiptItemUnitPriceValue(item: ReceiptItem) {
  if (item.unitPrice !== null) {
    return parseDecimalValue(item.unitPrice);
  }

  const quantity = getReceiptItemQuantityValue(item);

  if (quantity <= 0) {
    return 0;
  }

  return parseDecimalValue(item.totalPrice) / quantity;
}

export function getReceiptItemQuantityValue(item: ReceiptItem) {
  return parseDecimalValue(item.quantity);
}

export function getReceiptItemTotal(item: ReceiptItem) {
  return getReceiptItemQuantityValue(item) * getReceiptItemUnitPriceValue(item);
}

export function recalculateReceiptItem(item: ReceiptItem) {
  const quantityValue = getReceiptItemQuantityValue(item);
  const unitPriceValue = getReceiptItemUnitPriceValue(item);

  return {
    ...item,
    quantity: sanitizeDecimalInput(item.quantity) || '0',
    unitPrice: sanitizeCurrencyInput(item.unitPrice ?? '') || '0.00',
    totalPrice: formatMoneyDecimal(quantityValue * unitPriceValue),
  };
}

export function normalizeReceiptItems(items: ReceiptItem[]) {
  return items.map((item, index) => ({
    ...recalculateReceiptItem(item),
    sortOrder: index,
  }));
}

export function createEmptyReceiptItem(sortOrder: number): ReceiptItem {
  return {
    categoryId: null,
    name: '',
    quantity: '1',
    sortOrder,
    totalPrice: '0.00',
    unitPrice: '0.00',
  };
}

export function moveReceiptItemByDirection(
  items: ReceiptItem[],
  sortOrder: number,
  direction: 'down' | 'up',
) {
  const currentIndex = items.findIndex((item) => item.sortOrder === sortOrder);

  if (currentIndex === -1) {
    return items;
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [movingItem] = nextItems.splice(currentIndex, 1);
  nextItems.splice(targetIndex, 0, movingItem);

  return normalizeReceiptItems(nextItems);
}

export function recalculateReceipt(receipt: Receipt): Receipt {
  const normalizedItems = normalizeReceiptItems(receipt.items);
  const subtotalAmount = normalizedItems.reduce((sum, item) => sum + getReceiptItemTotal(item), 0);
  const taxAmount = parseDecimalValue(receipt.taxAmount);
  const tipAmount = parseDecimalValue(receipt.tipAmount);
  const discountAmount = parseDecimalValue(receipt.discountAmount);
  const totalAmount = subtotalAmount + taxAmount + tipAmount - discountAmount;

  return {
    ...receipt,
    items: normalizedItems,
    subtotalAmount: formatMoneyDecimal(subtotalAmount),
    totalAmount: formatMoneyDecimal(totalAmount),
  };
}
