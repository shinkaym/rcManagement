import { PencilEdit02Icon } from '@hugeicons/core-free-icons';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import type { Employee, EmployeeStatus } from '@/features/employee/model/employee.types';
import { navigationMetrics } from '@/navigation/navigation-metrics';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';
import { AppButton } from '@/shared/ui/button';
import { AppInput } from '@/shared/ui/input';

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
              <AppInput
                value={fullName}
                onChangeText={setFullName}
                placeholder='Employee full name'
                strategy='name'
                variant='outlined'
              />
            </LabeledField>

            <LabeledField label='Email'>
              <AppInput
                value={email}
                onChangeText={setEmail}
                placeholder='employee@email.com'
                strategy='email'
                variant='outlined'
              />
            </LabeledField>

            <LabeledField label='Phone number'>
              <AppInput
                value={phone}
                onChangeText={setPhone}
                placeholder='(090) 123-4567'
                strategy='phone'
                variant='outlined'
              />
            </LabeledField>

            <LabeledField label='Note'>
              <AppInput
                multiline
                value={note}
                onChangeText={setNote}
                placeholder='Short note about this employee'
                strategy='text'
                variant='outlined'
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
            <AppButton
              icon={PencilEdit02Icon}
              label={mode === 'edit' ? 'Save' : 'Create'}
              onPress={onClose}
              size='lg'
            />
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
  });
}
