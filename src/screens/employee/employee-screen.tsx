import { useMemo, useRef, useState } from 'react';
import type { ScrollView as ScrollViewType } from 'react-native';
import { Animated, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Employee } from '@/features/employee/model/employee.types';
import { navigationMetrics } from '@/navigation/navigation-metrics';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';
import { BackToTop } from '@/shared/ui/layout/back-to-top';
import { LoadingMore } from '@/shared/ui/layout/loading-more';

import { EmployeeCard, EmployeeCardSkeleton } from '../../features/employee/components/employee-card';
import { employeeMockData } from '../../mock/employee-data';
import { AppTheme } from '@/shared/theme';

const previewItemLimit = 5;

type EmployeeScreenProps = {
  onCreateEmployee: () => void;
  onEditEmployee: (employeeId: string) => void;
};

export function EmployeeScreen({ onCreateEmployee, onEditEmployee }: EmployeeScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const scrollRef = useRef<ScrollViewType | null>(null);
  const [draftQuery, setDraftQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const floatingAnim = useRef(new Animated.Value(1)).current;

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return employeeMockData;
    }

    return employeeMockData.filter((employee) => {
      const haystack = `${employee.name} ${employee.email ?? ''} ${employee.phone ?? ''} ${employee.note ?? ''} ${employee.status}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [searchQuery]);

  const visibleEmployees = useMemo(() => filteredEmployees.slice(0, previewItemLimit), [filteredEmployees]);

  function handleScroll(offsetY: number) {
    const shouldShow = offsetY <= 12;

    if (shouldShow === showFloatingButton) {
      return;
    }

    setShowFloatingButton(shouldShow);

    Animated.timing(floatingAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }

  function handleBackToTop() {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function handleEditEmployee(employee: Employee) {
    onEditEmployee(employee.id);
  }

  function handleConfirmSearch() {
    setSearchQuery(draftQuery);
  }

  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  const showMockFooter = searchQuery.trim().length === 0 && visibleEmployees.length > 0;

  return (
    <>
      <StatusBar barStyle='dark-content' />
      <View style={styles.screen}>
        <ScrollView
          ref={scrollRef}
          contentInsetAdjustmentBehavior='automatic'
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={(event) => handleScroll(event.nativeEvent.contentOffset.y)}
        >
          <View style={styles.searchRow}>
            <TextInput
              value={draftQuery}
              onChangeText={setDraftQuery}
              onSubmitEditing={handleConfirmSearch}
              placeholder='Search employees'
              placeholderTextColor={theme.colors.textHint}
              returnKeyType='search'
              style={styles.searchInput}
            />

            <Pressable
              accessibilityLabel='Confirm employee search'
              onPress={handleConfirmSearch}
              style={styles.searchButtonPressable}
            >
              {({ pressed }) => (
                <View style={[styles.searchButton, pressed ? styles.searchButtonPressed : null]}>
                  <Image
                    source={require('../../../assets/images/search.png')}
                    resizeMode='contain'
                    style={styles.searchIcon}
                  />
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.headerBlock}>
            <Text style={styles.metaLabel}>Total employees</Text>
            <Text style={styles.totalValue}>{employeeMockData.length} Members</Text>
          </View>

          {visibleEmployees.length > 0 ? (
            <View style={styles.list}>
              {visibleEmployees.map((employee, index) => (
                <View key={employee.id} style={index === visibleEmployees.length - 1 ? null : styles.cardSpacer}>
                  <EmployeeCard employee={employee} onEdit={handleEditEmployee} />
                </View>
              ))}

              {showMockFooter ? <EmployeeCardSkeleton withSpacing /> : null}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No employee matched</Text>
              <Text style={styles.emptyDescription}>
                Try another name, note, phone, email, or clear the current search keyword.
              </Text>
            </View>
          )}

          {showMockFooter ? (
            <>
              <LoadingMore />
              <BackToTop message='No more employees to show' onPress={handleBackToTop} />
            </>
          ) : null}
        </ScrollView>

        <Animated.View
          pointerEvents={showFloatingButton ? 'auto' : 'none'}
          style={[
            styles.floatingButtonContainer,
            {
              opacity: floatingAnim,
              transform: [{ translateY: floatingTranslateY }],
            },
          ]}
        >
          <Pressable onPress={onCreateEmployee} style={styles.floatingButtonPressable}>
            {({ pressed }) => (
              <View style={[styles.floatingButton, pressed ? styles.floatingButtonPressed : null]}>
                <Image source={require('../../../assets/images/pen.png')} resizeMode='contain' style={styles.penIcon} />
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
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
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      height: 44,
      paddingHorizontal: spacing.md,
      paddingVertical: 0,
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.textSecondary,
      backgroundColor: theme.colors.surface,
      color: theme.colors.textSecondary,
      ...typography.bodyLarge,
      lineHeight: 22,
      includeFontPadding: false,
    },
    searchButtonPressable: {
      borderRadius: radius.md,
    },
    searchButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.textSecondary,
      backgroundColor: theme.colors.surface,
    },
    searchButtonPressed: {
      opacity: 0.86,
    },
    searchIcon: {
      width: 30,
      height: 30,
    },
    headerBlock: {
      marginTop: spacing.sm,
    },
    metaLabel: {
      ...typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    totalValue: {
      ...typography.displayLarge,
      color: theme.colors.secondary,
    },
    list: {
      marginTop: spacing.md,
    },
    cardSpacer: {
      marginBottom: spacing.sm,
    },
    emptyState: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderWidth: 1,
      borderColor: theme.colors.borderAlt,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      gap: spacing.xs,
    },
    emptyTitle: {
      ...typography.titleLarge,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    emptyDescription: {
      ...typography.bodyMedium,
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
    floatingButtonContainer: {
      position: 'absolute',
      right: navigationMetrics.sideFloatingRight,
      bottom: navigationMetrics.sideFloatingBottom,
    },
    floatingButtonPressable: {
      borderRadius: radius.pill,
    },
    floatingButton: {
      width: navigationMetrics.sideFloatingButtonSize,
      height: navigationMetrics.sideFloatingButtonSize,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      boxShadow: theme.shadow.card,
    },
    floatingButtonPressed: {
      opacity: 0.9,
    },
    penIcon: {
      width: navigationMetrics.sideFloatingButtonSize - 6,
      height: navigationMetrics.sideFloatingButtonSize - 6,
    },
  });
}
