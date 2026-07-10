import { HugeiconsIcon } from '@hugeicons/react-native';
import { memo, type ComponentProps } from 'react';

export type AppIconProps = ComponentProps<typeof HugeiconsIcon>;

export const AppIcon = memo(function AppIconComponent(props: AppIconProps) {
  return <HugeiconsIcon {...props} />;
});
