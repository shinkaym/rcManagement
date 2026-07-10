import type { CropEdgePosition, CropHandlePosition, CropRect, ImageFrame, PreviewImageState, StageLayout } from './scan-types';

const minCropSize = 88;

export function getContainedFrame(stageLayout: StageLayout, previewImage: PreviewImageState): ImageFrame | null {
  if (stageLayout.width <= 0 || stageLayout.height <= 0 || previewImage.width <= 0 || previewImage.height <= 0) {
    return null;
  }

  const scale = Math.min(stageLayout.width / previewImage.width, stageLayout.height / previewImage.height);
  const width = previewImage.width * scale;
  const height = previewImage.height * scale;

  return {
    x: (stageLayout.width - width) / 2,
    y: (stageLayout.height - height) / 2,
    width,
    height,
  };
}

export function createDefaultCropRect(imageFrame: ImageFrame): CropRect {
  return {
    x: imageFrame.x,
    y: imageFrame.y,
    width: imageFrame.width,
    height: imageFrame.height,
  };
}

export function moveCropRect(cropRect: CropRect, imageFrame: ImageFrame, dx: number, dy: number): CropRect {
  const nextX = clamp(cropRect.x + dx, imageFrame.x, imageFrame.x + imageFrame.width - cropRect.width);
  const nextY = clamp(cropRect.y + dy, imageFrame.y, imageFrame.y + imageFrame.height - cropRect.height);

  return {
    ...cropRect,
    x: nextX,
    y: nextY,
  };
}

export function resizeCropRect(
  cropRect: CropRect,
  imageFrame: ImageFrame,
  dx: number,
  dy: number,
  position: CropHandlePosition | CropEdgePosition,
): CropRect {
  const rightEdge = cropRect.x + cropRect.width;
  const bottomEdge = cropRect.y + cropRect.height;
  const minWidth = Math.min(minCropSize, imageFrame.width);
  const minHeight = Math.min(minCropSize, imageFrame.height);

  if (position === 'topLeft') {
    const nextX = clamp(cropRect.x + dx, imageFrame.x, rightEdge - minWidth);
    const nextY = clamp(cropRect.y + dy, imageFrame.y, bottomEdge - minHeight);

    return {
      x: nextX,
      y: nextY,
      width: rightEdge - nextX,
      height: bottomEdge - nextY,
    };
  }

  if (position === 'topRight') {
    const nextRight = clamp(rightEdge + dx, cropRect.x + minWidth, imageFrame.x + imageFrame.width);
    const nextY = clamp(cropRect.y + dy, imageFrame.y, bottomEdge - minHeight);

    return {
      x: cropRect.x,
      y: nextY,
      width: nextRight - cropRect.x,
      height: bottomEdge - nextY,
    };
  }

  if (position === 'bottomLeft') {
    const nextX = clamp(cropRect.x + dx, imageFrame.x, rightEdge - minWidth);
    const nextBottom = clamp(bottomEdge + dy, cropRect.y + minHeight, imageFrame.y + imageFrame.height);

    return {
      x: nextX,
      y: cropRect.y,
      width: rightEdge - nextX,
      height: nextBottom - cropRect.y,
    };
  }

  if (position === 'top') {
    const nextY = clamp(cropRect.y + dy, imageFrame.y, bottomEdge - minHeight);

    return {
      x: cropRect.x,
      y: nextY,
      width: cropRect.width,
      height: bottomEdge - nextY,
    };
  }

  if (position === 'right') {
    const nextRight = clamp(rightEdge + dx, cropRect.x + minWidth, imageFrame.x + imageFrame.width);

    return {
      x: cropRect.x,
      y: cropRect.y,
      width: nextRight - cropRect.x,
      height: cropRect.height,
    };
  }

  if (position === 'bottom') {
    const nextBottom = clamp(bottomEdge + dy, cropRect.y + minHeight, imageFrame.y + imageFrame.height);

    return {
      x: cropRect.x,
      y: cropRect.y,
      width: cropRect.width,
      height: nextBottom - cropRect.y,
    };
  }

  if (position === 'left') {
    const nextX = clamp(cropRect.x + dx, imageFrame.x, rightEdge - minWidth);

    return {
      x: nextX,
      y: cropRect.y,
      width: rightEdge - nextX,
      height: cropRect.height,
    };
  }

  const nextRight = clamp(rightEdge + dx, cropRect.x + minWidth, imageFrame.x + imageFrame.width);
  const nextBottom = clamp(bottomEdge + dy, cropRect.y + minHeight, imageFrame.y + imageFrame.height);

  return {
    x: cropRect.x,
    y: cropRect.y,
    width: nextRight - cropRect.x,
    height: nextBottom - cropRect.y,
  };
}

export function mapCropRectToImagePixels(cropRect: CropRect, imageFrame: ImageFrame, previewImage: PreviewImageState) {
  const scaleX = previewImage.width / imageFrame.width;
  const scaleY = previewImage.height / imageFrame.height;
  const x = Math.max(0, Math.round((cropRect.x - imageFrame.x) * scaleX));
  const y = Math.max(0, Math.round((cropRect.y - imageFrame.y) * scaleY));
  const width = Math.max(1, Math.round(cropRect.width * scaleX));
  const height = Math.max(1, Math.round(cropRect.height * scaleY));

  return {
    x,
    y,
    width: Math.min(width, previewImage.width - x),
    height: Math.min(height, previewImage.height - y),
  };
}

export function clamp(value: number, minValue: number, maxValue: number) {
  return Math.min(Math.max(value, minValue), maxValue);
}
