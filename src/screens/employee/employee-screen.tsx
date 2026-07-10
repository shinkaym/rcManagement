import { useMemo, useRef, useState } from 'react';
import type { ScrollView as ScrollViewType, TextInput as TextInputType } from 'react-native';
import { ActivityIndicator, Animated, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';

import { navigationMetrics } from '@/navigation/navigation-metrics';
import { useAppTheme } from '@/shared/hooks/use-app-theme';
import { spacing } from '@/shared/theme/tokens/spacing';
import { radius } from '@/shared/theme/tokens/radius';
import { typography } from '@/shared/theme/tokens/typography';

import { EmployeeCard, EmployeeCardSkeleton } from '../../features/employee/components/employee-card';
import type { EmployeeItem } from '../../mock/employee-data';
import { employeeMockData } from '../../mock/employee-data';

const previewItemLimit = 5;

type EmployeeScreenProps = {
  onCreateEmployee: () => void;
  onEditEmployee: (employeeId: string) => void;
};

export function EmployeeScreen({ onCreateEmployee, onEditEmployee }: EmployeeScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const scrollRef = useRef<ScrollViewType | null>(null);
  const searchInputRef = useRef<TextInputType | null>(null);
  const [query, setQuery] = useState('');
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const floatingAnim = useRef(new Animated.Value(1)).current;

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return employeeMockData;
    }

    return employeeMockData.filter((employee) => {
      const haystack = `${employee.name} ${employee.role} ${employee.bio}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

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

  function handleEditEmployee(employee: EmployeeItem) {
    onEditEmployee(employee.id);
  }

  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  const showMockFooter = query.trim().length === 0 && visibleEmployees.length > 0;

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
              ref={searchInputRef}
              value={query}
              onChangeText={setQuery}
              placeholder='Search employees'
              placeholderTextColor={theme.colors.textHint}
              style={styles.searchInput}
            />

            <Pressable
              accessibilityLabel='Search employees'
              onPress={() => searchInputRef.current?.focus()}
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
              <Text style={styles.emptyDescription}>Try another name, role, or clear the current search keyword.</Text>
            </View>
          )}

          {showMockFooter ? (
            <>
              <View style={styles.loadingBlock}>
                <ActivityIndicator color={theme.colors.primary} size='small' />
                <Text style={styles.loadingText}>Loading more...</Text>
              </View>

              <View style={styles.footerDivider} />

              <View style={styles.footerBlock}>
                <Text style={styles.footerTitle}>No more employees to show</Text>
                <Pressable onPress={handleBackToTop} style={styles.backToTopPressable}>
                  {({ pressed }) => (
                    <Text style={[styles.backToTopText, pressed ? styles.backToTopTextPressed : null]}>
                      Back to top
                    </Text>
                  )}
                </Pressable>
              </View>
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

function createStyles(theme: ReturnType<typeof useAppTheme>) {
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
    loadingBlock: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
      gap: spacing.xs,
    },
    loadingText: {
      ...typography.bodyMedium,
      color: theme.colors.textTertiary,
      textAlign: 'center',
    },
    footerDivider: {
      height: 1,
      marginTop: spacing.xl,
      backgroundColor: 'rgba(245, 124, 0, 0.16)',
    },
    footerBlock: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
      gap: spacing.xs,
    },
    footerTitle: {
      ...typography.titleMedium,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    backToTopPressable: {
      borderRadius: radius.pill,
    },
    backToTopText: {
      ...typography.bodyMedium,
      color: theme.colors.primary,
      fontFamily: typography.titleMedium.fontFamily,
    },
    backToTopTextPressed: {
      opacity: 0.72,
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
      boxShadow: `0 4px 12px ${theme.colors.shadow}`,
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
