import { DrawerActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { CategoryScreen } from '@/screens/category/category-screen';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { MainHeader } from '../components/main-header';
import type { CategoryStackParamList } from '../navigation-types';
import { CATEGORY_ROUTES } from '../route-names';

const Stack = createNativeStackNavigator<CategoryStackParamList>();

export function CategoryStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={CATEGORY_ROUTES.CATEGORY} component={CategoryRouteScreen} />
    </Stack.Navigator>
  );
}

function CategoryRouteScreen({ navigation }: { navigation: any }) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.screen}>
      <MainHeader title='Category' onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />
      <View style={styles.content}>
        <CategoryScreen />
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
  });
}
