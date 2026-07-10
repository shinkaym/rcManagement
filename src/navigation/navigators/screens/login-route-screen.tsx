import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { LoginScreen } from '@/screens/auth/login-screen';

import type { RootStackParamList } from '../../navigation-types';
import { ROOT_ROUTES } from '../../route-names';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROOT_ROUTES.LOGIN>;

export function LoginRouteScreen({ navigation }: Props) {
  function handleContinue() {
    navigation.reset({
      index: 0,
      routes: [{ name: ROOT_ROUTES.APP_DRAWER }],
    });
  }

  return <LoginScreen onContinueWithApple={handleContinue} onContinueWithGoogle={handleContinue} />;
}
