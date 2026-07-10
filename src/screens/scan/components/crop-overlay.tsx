import { useMemo, useRef, type MutableRefObject } from 'react';
import { StyleSheet, View, type GestureResponderEvent, type ViewProps } from 'react-native';

import { useAppTheme } from '@/shared/hooks/use-app-theme';

import { moveCropRect, resizeCropRect } from '../scan-geometry';
import { createStyles } from '../scan-screen.styles';
import type { CropEdgePosition, CropHandlePosition, CropRect, ImageFrame } from '../scan-types';

type CropOverlayProps = {
  cropRect: CropRect;
  imageFrame: ImageFrame;
  onChangeRect: (rect: CropRect) => void;
};

export function CropOverlay({ cropRect, imageFrame, onChangeRect }: CropOverlayProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme, 0, 0), [theme]);
  const dragStartRef = useRef<TouchGestureState | null>(null);
  const topLeftStartRef = useRef<TouchGestureState | null>(null);
  const topRightStartRef = useRef<TouchGestureState | null>(null);
  const bottomLeftStartRef = useRef<TouchGestureState | null>(null);
  const bottomRightStartRef = useRef<TouchGestureState | null>(null);

  const moveResponder = createTouchResponder(dragStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    moveCropRect(startRect, imageFrame, dx, dy),
  );
  const topLeftResponder = createTouchResponder(topLeftStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'topLeft'),
  );
  const topRightResponder = createTouchResponder(topRightStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'topRight'),
  );
  const bottomLeftResponder = createTouchResponder(bottomLeftStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'bottomLeft'),
  );
  const bottomRightResponder = createTouchResponder(bottomRightStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'bottomRight'),
  );
  const topEdgeStartRef = useRef<TouchGestureState | null>(null);
  const rightEdgeStartRef = useRef<TouchGestureState | null>(null);
  const bottomEdgeStartRef = useRef<TouchGestureState | null>(null);
  const leftEdgeStartRef = useRef<TouchGestureState | null>(null);
  const topEdgeResponder = createTouchResponder(topEdgeStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'top'),
  );
  const rightEdgeResponder = createTouchResponder(rightEdgeStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'right'),
  );
  const bottomEdgeResponder = createTouchResponder(bottomEdgeStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'bottom'),
  );
  const leftEdgeResponder = createTouchResponder(leftEdgeStartRef, cropRect, onChangeRect, (startRect, dx, dy) =>
    resizeCropRect(startRect, imageFrame, dx, dy, 'left'),
  );

  return (
    <View pointerEvents='box-none' style={StyleSheet.absoluteFill}>
      <View
        pointerEvents='none'
        style={[
          styles.cropShade,
          {
            top: imageFrame.y,
            left: imageFrame.x,
            width: imageFrame.width,
            height: Math.max(cropRect.y - imageFrame.y, 0),
          },
        ]}
      />
      <View
        pointerEvents='none'
        style={[
          styles.cropShade,
          {
            top: cropRect.y,
            left: imageFrame.x,
            width: Math.max(cropRect.x - imageFrame.x, 0),
            height: cropRect.height,
          },
        ]}
      />
      <View
        pointerEvents='none'
        style={[
          styles.cropShade,
          {
            top: cropRect.y,
            left: cropRect.x + cropRect.width,
            width: Math.max(imageFrame.x + imageFrame.width - (cropRect.x + cropRect.width), 0),
            height: cropRect.height,
          },
        ]}
      />
      <View
        pointerEvents='none'
        style={[
          styles.cropShade,
          {
            top: cropRect.y + cropRect.height,
            left: imageFrame.x,
            width: imageFrame.width,
            height: Math.max(imageFrame.y + imageFrame.height - (cropRect.y + cropRect.height), 0),
          },
        ]}
      />

      <View
        style={[
          styles.cropRect,
          {
            left: cropRect.x,
            top: cropRect.y,
            width: cropRect.width,
            height: cropRect.height,
          },
        ]}
      >
        <View style={styles.cropRectBorder} />
        <View pointerEvents='none' style={styles.cropGridVerticalLeft} />
        <View pointerEvents='none' style={styles.cropGridVerticalRight} />
        <View pointerEvents='none' style={styles.cropGridHorizontalTop} />
        <View pointerEvents='none' style={styles.cropGridHorizontalBottom} />
        <View style={styles.cropMoveSurface} {...moveResponder} />
        <CropEdge position='top' responderProps={topEdgeResponder} styles={styles} />
        <CropEdge position='right' responderProps={rightEdgeResponder} styles={styles} />
        <CropEdge position='bottom' responderProps={bottomEdgeResponder} styles={styles} />
        <CropEdge position='left' responderProps={leftEdgeResponder} styles={styles} />

        <CropHandle position='topLeft' responderProps={topLeftResponder} styles={styles} />
        <CropHandle position='topRight' responderProps={topRightResponder} styles={styles} />
        <CropHandle position='bottomLeft' responderProps={bottomLeftResponder} styles={styles} />
        <CropHandle position='bottomRight' responderProps={bottomRightResponder} styles={styles} />
      </View>
    </View>
  );
}

type CropHandleProps = {
  position: CropHandlePosition;
  responderProps: ViewResponderProps;
  styles: ReturnType<typeof createStyles>;
};

function CropHandle({ position, responderProps, styles }: CropHandleProps) {
  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('Left');

  return (
    <View
      style={[
        styles.cropHandleTouchArea,
        isTop ? styles.cropHandleTop : styles.cropHandleBottom,
        isLeft ? styles.cropHandleLeft : styles.cropHandleRight,
      ]}
      {...responderProps}
    >
      <View
        style={[
          styles.cropHandleHorizontal,
          isLeft ? styles.cropHandleHorizontalLeft : styles.cropHandleHorizontalRight,
          isTop ? styles.cropHandleHorizontalTop : styles.cropHandleHorizontalBottom,
        ]}
      />
      <View
        style={[
          styles.cropHandleVertical,
          isLeft ? styles.cropHandleVerticalLeft : styles.cropHandleVerticalRight,
          isTop ? styles.cropHandleVerticalTop : styles.cropHandleVerticalBottom,
        ]}
      />
    </View>
  );
}

type CropEdgeProps = {
  position: CropEdgePosition;
  responderProps: ViewResponderProps;
  styles: ReturnType<typeof createStyles>;
};

function CropEdge({ position, responderProps, styles }: CropEdgeProps) {
  return (
    <View
      style={[
        styles.cropEdgeTouchArea,
        position === 'top' ? styles.cropEdgeTop : null,
        position === 'right' ? styles.cropEdgeRight : null,
        position === 'bottom' ? styles.cropEdgeBottom : null,
        position === 'left' ? styles.cropEdgeLeft : null,
      ]}
      {...responderProps}
    />
  );
}

type TouchGestureState = {
  pageX: number;
  pageY: number;
  rect: CropRect;
};

type ViewResponderProps = Pick<
  ViewProps,
  | 'onMoveShouldSetResponder'
  | 'onResponderGrant'
  | 'onResponderMove'
  | 'onResponderRelease'
  | 'onResponderTerminate'
  | 'onStartShouldSetResponder'
>;

function createTouchResponder(
  startRef: MutableRefObject<TouchGestureState | null>,
  cropRect: CropRect,
  onChangeRect: (rect: CropRect) => void,
  transformRect: (startRect: CropRect, dx: number, dy: number) => CropRect,
): ViewResponderProps {
  function beginGesture(event: GestureResponderEvent) {
    startRef.current = {
      pageX: event.nativeEvent.pageX,
      pageY: event.nativeEvent.pageY,
      rect: cropRect,
    };
  }

  function moveGesture(event: GestureResponderEvent) {
    const startState = startRef.current;

    if (!startState) {
      return;
    }

    const dx = event.nativeEvent.pageX - startState.pageX;
    const dy = event.nativeEvent.pageY - startState.pageY;
    onChangeRect(transformRect(startState.rect, dx, dy));
  }

  function endGesture() {
    startRef.current = null;
  }

  return {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderGrant: beginGesture,
    onResponderMove: moveGesture,
    onResponderRelease: endGesture,
    onResponderTerminate: endGesture,
  };
}
