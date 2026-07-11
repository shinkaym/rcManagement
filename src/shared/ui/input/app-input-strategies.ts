import type { TextInputProps } from 'react-native';

type StrategyTextInputProps = Pick<
  TextInputProps,
  | 'autoCapitalize'
  | 'autoComplete'
  | 'autoCorrect'
  | 'enterKeyHint'
  | 'inputMode'
  | 'keyboardType'
  | 'returnKeyType'
  | 'textContentType'
>;

export type AppInputStrategyName =
  | 'text'
  | 'name'
  | 'email'
  | 'phone'
  | 'decimal'
  | 'currency'
  | 'card-last-four';

export type AppInputStrategy = {
  getDisplayValue?: (value: string) => string;
  getNextValue?: (value: string) => string;
  props?: StrategyTextInputProps;
};

function sanitizeDecimalInput(value: string) {
  const sanitizedValue = value.replace(/[^0-9.]/g, '');
  const firstDotIndex = sanitizedValue.indexOf('.');

  if (firstDotIndex === -1) {
    return sanitizedValue;
  }

  const head = sanitizedValue.slice(0, firstDotIndex + 1);
  const tail = sanitizedValue.slice(firstDotIndex + 1).replace(/\./g, '');

  return `${head}${tail}`;
}

function sanitizeCardLastFourInput(value: string) {
  return value.replace(/[^0-9]/g, '').slice(0, 4);
}

function formatUsPhoneValue(value: string) {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 10);

  if (!digits) {
    return '';
  }

  if (digits.length < 4) {
    return digits.length === 3 ? `(${digits})` : `(${digits}`;
  }

  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const emailStrategy: AppInputStrategy = {
  props: {
    autoCapitalize: 'none',
    autoComplete: 'email',
    autoCorrect: false,
    enterKeyHint: 'next',
    inputMode: 'email',
    keyboardType: 'email-address',
    returnKeyType: 'next',
    textContentType: 'emailAddress',
  },
  getDisplayValue: (value) => value.trimStart(),
  getNextValue: (value) => value.replace(/\s+/g, ''),
};

const phoneStrategy: AppInputStrategy = {
  props: {
    autoCapitalize: 'none',
    autoComplete: 'tel',
    autoCorrect: false,
    enterKeyHint: 'next',
    inputMode: 'tel',
    keyboardType: 'phone-pad',
    returnKeyType: 'next',
    textContentType: 'telephoneNumber',
  },
  getDisplayValue: formatUsPhoneValue,
  getNextValue: formatUsPhoneValue,
};

const decimalStrategy: AppInputStrategy = {
  props: {
    autoCapitalize: 'none',
    autoCorrect: false,
    enterKeyHint: 'done',
    inputMode: 'decimal',
    keyboardType: 'decimal-pad',
    returnKeyType: 'done',
  },
  getDisplayValue: sanitizeDecimalInput,
  getNextValue: sanitizeDecimalInput,
};

const currencyStrategy: AppInputStrategy = {
  ...decimalStrategy,
};

const cardLastFourStrategy: AppInputStrategy = {
  props: {
    autoCapitalize: 'none',
    autoComplete: 'off',
    autoCorrect: false,
    enterKeyHint: 'done',
    inputMode: 'numeric',
    keyboardType: 'number-pad',
    returnKeyType: 'done',
  },
  getDisplayValue: sanitizeCardLastFourInput,
  getNextValue: sanitizeCardLastFourInput,
};

export const appInputStrategies: Record<AppInputStrategyName, AppInputStrategy> = {
  text: {
    props: {
      autoCapitalize: 'sentences',
      autoComplete: 'off',
      autoCorrect: false,
      enterKeyHint: 'next',
      inputMode: 'text',
      keyboardType: 'default',
      returnKeyType: 'next',
    },
  },
  name: {
    props: {
      autoCapitalize: 'words',
      autoComplete: 'name',
      autoCorrect: false,
      enterKeyHint: 'next',
      inputMode: 'text',
      keyboardType: 'default',
      returnKeyType: 'next',
      textContentType: 'name',
    },
  },
  email: emailStrategy,
  phone: phoneStrategy,
  decimal: decimalStrategy,
  currency: currencyStrategy,
  'card-last-four': cardLastFourStrategy,
};

export function resolveAppInputStrategy(strategyName: AppInputStrategyName) {
  return appInputStrategies[strategyName];
}

