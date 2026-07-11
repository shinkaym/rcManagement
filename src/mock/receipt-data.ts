import type { Receipt } from '@/features/receipts/model/receipt.types';

import { expenseCategorySeed } from './category-data';

const mockReceiptTimestamp = '2026-07-02T00:00:00.000Z';
const defaultCategory = expenseCategorySeed[0];

export const receiptPreviewSeed: Receipt = {
  id: 'receipt-preview-shell',
  category: defaultCategory,
  categoryId: defaultCategory.id,
  createdAt: mockReceiptTimestamp,
  currency: 'USD',
  discountAmount: '0.00',
  items: [
    {
      categoryId: null,
      name: 'Fuel',
      quantity: '1',
      sortOrder: 0,
      totalPrice: '5.00',
      unitPrice: '5.00',
    },
    {
      categoryId: null,
      name: 'Sparkling Water',
      quantity: '2',
      sortOrder: 1,
      totalPrice: '7.00',
      unitPrice: '3.50',
    },
    {
      categoryId: null,
      name: 'Protein Snack',
      quantity: '1',
      sortOrder: 2,
      totalPrice: '6.25',
      unitPrice: '6.25',
    },
  ],
  merchantAddress: '123 Market St, Suite 400',
  merchantName: 'Shell Gas Station',
  merchantNormalizedName: 'shell gas station',
  merchantPhone: '(555) 019-2837',
  merchantTaxId: null,
  note: 'Fill up',
  paymentCardLast4: '4224',
  paymentMethodName: 'VISA',
  paymentMethodType: 'CARD',
  paymentRawText: 'VISA ****4224',
  receiptDate: '2023-10-24',
  source: 'MANUAL',
  status: 'NEEDS_REVIEW',
  subtotalAmount: '18.25',
  tagNames: ['fuel', 'travel'],
  taxAmount: '12.00',
  tipAmount: '12.00',
  totalAmount: '42.25',
  updatedAt: mockReceiptTimestamp,
};
