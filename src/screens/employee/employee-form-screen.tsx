import { PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { AppIcon } from '@/shared/ui/icon';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Employee, EmployeeStatus } from '@/features/employee/model/employee.types';
import { navigationMetrics } from '@/navigation/navigation-metrics';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';

import { employeeMockData } from '../../mock/employee-data';
import { AppTheme } from '@/shared/theme';

type EmployeeFormMode = 'create' | 'edit';

type EmployeeFormScreenProps = {
  employeeId?: string;
  mode: EmployeeFormMode;
  onClose: () => void;
};

type EmployeeFormSeed = {
  email: string;
  name: string;
  note: string;
  phone: string;
  status: EmployeeStatus;
};

const statusTabs = [
  { label: 'Active', value: 'ACTIVE' as const },
  { label: 'Inactive', value: 'INACTIVE' as const },
];

export function EmployeeFormScreen({ employeeId, mode, onClose }: EmployeeFormScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const employee = useMemo(
    () => employeeMockData.find((item) => item.id === employeeId) ?? employeeMockData[0],
    [employeeId],
  );

  const seed = mode === 'edit' ? buildEmployeeFormSeed(employee) : buildCreateSeed();
  const [fullName, setFullName] = useState(seed.name);
  const [email, setEmail] = useState(seed.email);
  const [phone, setPhone] = useState(seed.phone);
  const [note, setNote] = useState(seed.note);
  const [status, setStatus] = useState<EmployeeStatus>(seed.status);

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
          <FieldStack>
            <LabeledField label='Full name'>
              <FormTextInput value={fullName} onChangeText={setFullName} placeholder='Employee full name' />
            </LabeledField>

            <LabeledField label='Email'>
              <FormTextInput
                value={email}
                onChangeText={setEmail}
                placeholder='employee@email.com'
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </LabeledField>

            <LabeledField label='Phone number'>
              <FormTextInput
                value={phone}
                onChangeText={setPhone}
                placeholder='(090) 123-4567'
                keyboardType='phone-pad'
              />
            </LabeledField>

            <LabeledField label='Note'>
              <FormTextInput
                multiline
                value={note}
                onChangeText={setNote}
                placeholder='Short note about this employee'
              />
            </LabeledField>

            <View style={styles.statusSection}>
              <Text style={styles.fieldLabel}>Status</Text>
              <View style={styles.statusTabsWrap}>
                {statusTabs.map((item) => {
                  const isSelected = item.value === status;

                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setStatus(item.value)}
                      style={styles.statusOptionPressable}
                    >
                      {({ pressed }) => (
                        <View
                          style={[
                            styles.statusOption,
                            isSelected
                              ? item.value === 'ACTIVE'
                                ? styles.statusOptionActive
                                : styles.statusOptionInactive
                              : styles.statusOptionDefault,
                            pressed ? styles.statusOptionPressed : null,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusOptionLabel,
                              isSelected
                                ? item.value === 'ACTIVE'
                                  ? styles.statusOptionLabelActive
                                  : styles.statusOptionLabelInactive
                                : null,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </FieldStack>

          <View style={styles.actionsRow}>
            <Pressable onPress={onClose} style={styles.primaryPressable}>
              {({ pressed }) => (
                <View style={[styles.primaryButton, pressed ? styles.primaryButtonPressed : null]}>
                  <AppIcon icon={PencilEdit02Icon} size={18} color={staticColors.white} strokeWidth={2.1} />
                  <Text style={styles.primaryButtonLabel}>{mode === 'edit' ? 'Save' : 'Create'}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

type FieldStackProps = {
  children: ReactNode;
};

function FieldStack({ children }: FieldStackProps) {
  const styles = createStyles(useAppTheme());

  return <View style={styles.fieldStack}>{children}</View>;
}

type LabeledFieldProps = {
  children: ReactNode;
  label: string;
};

function LabeledField({ children, label }: LabeledFieldProps) {
  const styles = createStyles(useAppTheme());

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

type FormTextInputProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words';
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function FormTextInput({
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: FormTextInputProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      multiline={multiline}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textHint}
      style={[styles.input, multiline ? styles.inputMultiline : null]}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );
}

function buildEmployeeFormSeed(employee: Employee): EmployeeFormSeed {
  return {
    email: employee.email ?? '',
    name: employee.name,
    note: employee.note ?? '',
    phone: employee.phone ?? '',
    status: employee.status,
  };
}

function buildCreateSeed(): EmployeeFormSeed {
  return {
    email: '',
    name: '',
    note: '',
    phone: '',
    status: 'ACTIVE',
  };
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
      gap: spacing.lg,
    },
    fieldStack: {
      gap: spacing.sm,
    },
    fieldBlock: {
      gap: spacing.sm,
    },
    fieldLabel: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
    },
    input: {
      height: 48,
      paddingHorizontal: spacing.md,
      paddingVertical: 0,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textSecondary,
      ...typography.bodyLarge,
      lineHeight: 22,
      includeFontPadding: false,
    },
    inputMultiline: {
      minHeight: 96,
      height: undefined,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      includeFontPadding: true,
    },
    statusSection: {
      gap: spacing.sm,
    },
    statusTabsWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statusOptionPressable: {
      borderRadius: radius.md,
    },
    statusOption: {
      minWidth: 104,
      minHeight: 36,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
    },
    statusOptionDefault: {
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surfaceAlt,
    },
    statusOptionActive: {
      borderColor: theme.colors.success,
      backgroundColor: theme.colors.success,
    },
    statusOptionInactive: {
      borderColor: theme.colors.danger,
      backgroundColor: theme.colors.danger,
    },
    statusOptionPressed: {
      opacity: 0.88,
    },
    statusOptionLabel: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    statusOptionLabelActive: {
      color: staticColors.white,
    },
    statusOptionLabelInactive: {
      color: staticColors.white,
    },
    actionsRow: {
      marginTop: spacing.sm,
    },
    primaryPressable: {
      borderRadius: radius.lg,
    },
    primaryButton: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
      boxShadow: theme.shadow.accentStrong,
    },
    primaryButtonPressed: {
      opacity: 0.92,
    },
    primaryButtonLabel: {
      ...typography.titleMedium,
      color: staticColors.white,
    },
  });
}
