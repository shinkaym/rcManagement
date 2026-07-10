declare module 'expo-router' {
  export type RoutePath = string;

  export function usePathname(): string;
  export function useRouter(): {
    back(): void;
    canGoBack(): boolean;
    push(...args: any[]): void;
    replace(...args: any[]): void;
  };
}

declare module 'expo-status-bar' {
  import type { ComponentType } from 'react';

  export const StatusBar: ComponentType<any>;
}

declare module 'expo-image' {
  import type { ComponentType } from 'react';

  export const Image: ComponentType<any>;
}

declare module 'expo-camera' {
  import type { ComponentType } from 'react';

  export const CameraView: ComponentType<any>;
  export function useCameraPermissions(): any;
}

declare module 'expo-image-manipulator' {
  export const ImageManipulator: any;
  export const SaveFormat: any;
}

declare module 'expo-image-picker' {
  const ImagePicker: any;
  export = ImagePicker;
}

declare module 'expo-media-library/legacy' {
  export function createAssetAsync(...args: any[]): Promise<any>;
  export function requestPermissionsAsync(...args: any[]): Promise<any>;
}
