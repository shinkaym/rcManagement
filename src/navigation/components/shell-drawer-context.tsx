import { createContext, useContext } from 'react';

type ShellDrawerContextValue = {
  closeDrawer: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  toggleDrawer: () => void;
};

export const ShellDrawerContext = createContext<ShellDrawerContextValue | null>(null);

export function useShellDrawer() {
  const context = useContext(ShellDrawerContext);

  if (!context) {
    throw new Error('useShellDrawer must be used within a ShellDrawerContext provider.');
  }

  return context;
}
