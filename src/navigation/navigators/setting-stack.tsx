import type { ReactNode } from 'react';
import { DrawerActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { FeaturePlaceholderScreen } from '@/screens/placeholders/feature-placeholder-screen';
import { SettingScreen, type SettingDestination } from '@/screens/setting/setting-screen';
import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { MainHeader } from '../components/main-header';
import { SubHeader } from '../components/sub-header';
import type { SettingStackParamList } from '../navigation-types';
import { SETTING_ROUTES } from '../route-names';

const Stack = createNativeStackNavigator<SettingStackParamList>();

export function SettingStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SETTING_ROUTES.SETTING} component={SettingRouteScreen} />
      <Stack.Screen name={SETTING_ROUTES.MY_ACCOUNT} component={MyAccountRouteScreen} />
      <Stack.Screen name={SETTING_ROUTES.MAP} component={MapRouteScreen} />
      <Stack.Screen name={SETTING_ROUTES.HELP} component={HelpRouteScreen} />
      <Stack.Screen name={SETTING_ROUTES.ABOUT_US} component={AboutUsRouteScreen} />
    </Stack.Navigator>
  );
}

function SettingRouteScreen({
  navigation,
}: NativeStackScreenProps<SettingStackParamList, typeof SETTING_ROUTES.SETTING>) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  function handleSelectDestination(destination: SettingDestination) {
    navigation.navigate(destination);
  }

  return (
    <View style={styles.screen}>
      <MainHeader title='Setting' onMenuPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} />
      <View style={styles.content}>
        <SettingScreen onSelectDestination={handleSelectDestination} />
      </View>
    </View>
  );
}

function MyAccountRouteScreen({
  navigation,
}: NativeStackScreenProps<SettingStackParamList, typeof SETTING_ROUTES.MY_ACCOUNT>) {
  return (
    <SubScreenFrame onBackPress={() => navigation.goBack()} title='My Account'>
      <FeaturePlaceholderScreen
        description='Manage your personal information and profile preferences.'
        title='My Account'
        withBottomNavSpacing
      />
    </SubScreenFrame>
  );
}

function MapRouteScreen({ navigation }: NativeStackScreenProps<SettingStackParamList, typeof SETTING_ROUTES.MAP>) {
  return (
    <SubScreenFrame onBackPress={() => navigation.goBack()} title='Map'>
      <FeaturePlaceholderScreen
        description='Open the saved places and location tools tied to your account.'
        title='Map'
        withBottomNavSpacing
      />
    </SubScreenFrame>
  );
}

function HelpRouteScreen({ navigation }: NativeStackScreenProps<SettingStackParamList, typeof SETTING_ROUTES.HELP>) {
  return (
    <SubScreenFrame onBackPress={() => navigation.goBack()} title='Help'>
      <FeaturePlaceholderScreen
        description='Reach support resources and current guidance for using the app.'
        title='Help'
        withBottomNavSpacing
      />
    </SubScreenFrame>
  );
}

function AboutUsRouteScreen({
  navigation,
}: NativeStackScreenProps<SettingStackParamList, typeof SETTING_ROUTES.ABOUT_US>) {
  return (
    <SubScreenFrame onBackPress={() => navigation.goBack()} title='About Us'>
      <FeaturePlaceholderScreen
        description='Read product background and team information.'
        title='About Us'
        withBottomNavSpacing
      />
    </SubScreenFrame>
  );
}

type SubScreenFrameProps = {
  children: ReactNode;
  onBackPress: () => void;
  title: string;
};

function SubScreenFrame({ children, onBackPress, title }: SubScreenFrameProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.screen}>
      <SubHeader onBackPress={onBackPress} title={title} />
      <View style={styles.content}>{children}</View>
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
