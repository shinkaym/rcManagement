import { useColorScheme } from 'react-native';
import { themes } from '../theme';

export function useAppTheme() {
  const scheme = useColorScheme();
  // return scheme === 'dark' ? themes.dark : themes.light;
  return themes.light;
}
