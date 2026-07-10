export type ScreenMode = 'capture' | 'crop' | 'preview';

export type PreviewImageState = {
  height: number;
  uri: string;
  width: number;
};

export type StageLayout = {
  height: number;
  width: number;
};

export type CropRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type ImageFrame = CropRect;

export type CropHandlePosition = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
export type CropEdgePosition = 'bottom' | 'left' | 'right' | 'top';

export type CameraPermissionStatus = 'blocked' | 'checking' | 'denied' | 'granted';
