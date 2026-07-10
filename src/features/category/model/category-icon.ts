import {
  Airplane01Icon,
  Book01Icon,
  Car01Icon,
  Coffee02Icon,
  GiftIcon,
  HealthIcon,
  House01Icon,
  MoneyReceive01Icon,
  Restaurant01Icon,
  ShoppingBag02Icon,
  TShirtIcon,
  Wallet02Icon,
} from '@hugeicons/core-free-icons';

import type { ExpenseCategory } from './category.types';

export const expenseCategoryIconCatalog = {
  food: {
    icon: Restaurant01Icon,
  },
  transport: {
    icon: Car01Icon,
  },
  shopping: {
    icon: ShoppingBag02Icon,
  },
  housing: {
    icon: House01Icon,
  },
  travel: {
    icon: Airplane01Icon,
  },
  salary: {
    icon: MoneyReceive01Icon,
  },
  coffee: {
    icon: Coffee02Icon,
  },
  books: {
    icon: Book01Icon,
  },
  freelance: {
    icon: Wallet02Icon,
  },
  clothes: {
    icon: TShirtIcon,
  },
  gifts: {
    icon: GiftIcon,
  },
  health: {
    icon: HealthIcon,
  },
} as const;

export const expenseCategoryColorPresets = [
  '#F57C00',
  '#2F80ED',
  '#27AE60',
  '#D63384',
  '#7C4DFF',
  '#EB5757',
  '#0EA5B7',
  '#A16207',
] as const;

export type ExpenseCategoryIconCode = keyof typeof expenseCategoryIconCatalog;

export const expenseCategoryIconGroups = [
  {
    title: 'Daily',
    iconCodes: ['food', 'transport', 'shopping', 'housing', 'travel', 'coffee'] as ExpenseCategoryIconCode[],
  },
  {
    title: 'Money & Other',
    iconCodes: ['salary', 'freelance', 'books', 'clothes', 'gifts', 'health'] as ExpenseCategoryIconCode[],
  },
] as const;

const fallbackExpenseCategoryIconCode: ExpenseCategoryIconCode = 'shopping';

function isExpenseCategoryIconCode(value: string): value is ExpenseCategoryIconCode {
  return value in expenseCategoryIconCatalog;
}

export function coerceExpenseCategoryIconCode(value: string | null | undefined): ExpenseCategoryIconCode | null {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue && isExpenseCategoryIconCode(normalizedValue)) {
    return normalizedValue;
  }

  return null;
}

export function resolveExpenseCategoryIconCode(
  category: Pick<ExpenseCategory, 'code' | 'icon'> | null | undefined,
): ExpenseCategoryIconCode {
  const iconCandidate = coerceExpenseCategoryIconCode(category?.icon);

  if (iconCandidate) {
    return iconCandidate;
  }

  const codeCandidate = coerceExpenseCategoryIconCode(category?.code);

  if (codeCandidate) {
    return codeCandidate;
  }

  return fallbackExpenseCategoryIconCode;
}
