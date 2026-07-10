import { StyleSheet } from 'react-native';

import { AppTheme } from '@/shared/theme';
import { staticColors } from '@/shared/theme/tokens/colors';
import { radius } from '@/shared/theme/tokens/radius';
import { spacing } from '@/shared/theme/tokens/spacing';
import { typography } from '@/shared/theme/tokens/typography';

export function createStyles(theme: AppTheme, topInset: number, bottomInset: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: staticColors.black,
    },
    cameraPreview: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    previewBackdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: '#050607',
    },
    previewGlowTop: {
      position: 'absolute',
      top: '10%',
      left: '-10%',
      width: 260,
      height: 260,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(245, 124, 0, 0.12)',
      transform: [{ rotate: '18deg' }],
    },
    previewGlowBottom: {
      position: 'absolute',
      right: '-18%',
      bottom: '12%',
      width: 300,
      height: 300,
      borderRadius: radius.xxxl,
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      transform: [{ rotate: '-12deg' }],
    },
    content: {
      flex: 1,
      paddingTop: topInset > 0 ? topInset + spacing.sm : spacing.xl,
      paddingRight: spacing.lg,
      paddingBottom: bottomInset > 0 ? bottomInset + spacing.lg : spacing.xl,
      paddingLeft: spacing.lg,
    },
    centerStage: {
      flex: 1,
      justifyContent: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
      overflow: 'hidden',
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    cameraStatusOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
    },
    cameraStatusText: {
      ...typography.bodyMedium,
      maxWidth: 360,
      color: staticColors.white,
      textAlign: 'center',
    },
    cameraStatusActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    pillActionPressable: {
      borderRadius: radius.lg,
    },
    pillActionButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
    },
    pillActionButtonFilled: {
      backgroundColor: theme.colors.primary,
    },
    pillActionButtonOutlined: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.28)',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    pillActionLabel: {
      ...typography.labelLarge,
      fontFamily: typography.titleMedium.fontFamily,
    },
    pillActionLabelFilled: {
      color: staticColors.white,
    },
    pillActionLabelOutlined: {
      color: staticColors.white,
    },
    bottomSection: {
      alignItems: 'center',
      gap: spacing.lg,
    },
    previewFooter: {
      gap: spacing.lg,
    },
    previewActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cropFooter: {
      gap: spacing.md,
    },
    cropToolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
    },
    statusMessagePill: {
      alignSelf: 'center',
      maxWidth: 360,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.82)',
    },
    statusMessageText: {
      ...typography.bodyMedium,
      color: staticColors.white,
      textAlign: 'center',
    },
    zoomControl: {
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(25, 28, 29, 0.74)',
    },
    zoomControlRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    zoomStepPressable: {
      borderRadius: radius.pill,
    },
    zoomStepButton: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderCurve: 'continuous',
    },
    zoomTrackWrapper: {
      width: 220,
      marginHorizontal: spacing.xs,
      justifyContent: 'center',
    },
    zoomTrack: {
      width: '100%',
      height: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.42)',
      borderRadius: radius.pill,
      overflow: 'visible',
      justifyContent: 'center',
    },
    zoomTrackFill: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: staticColors.white,
      borderRadius: radius.pill,
      opacity: 0.35,
    },
    zoomThumb: {
      position: 'absolute',
      top: -8,
      width: 18,
      height: 18,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: theme.colors.primary,
    },
    zoomValueLabel: {
      ...typography.labelLarge,
      marginTop: spacing.xxs,
      color: 'rgba(255, 255, 255, 0.84)',
      textAlign: 'center',
    },
    capturePressable: {
      borderRadius: radius.pill,
    },
    captureShell: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureOuterRing: {
      width: 92,
      height: 92,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.72)',
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    captureOuterRingBusy: {
      borderColor: 'rgba(255, 255, 255, 0.52)',
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    captureMiddleRing: {
      width: 80,
      height: 80,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: 'rgba(146, 146, 146, 0.72)',
      backgroundColor: 'rgba(255, 255, 255, 0.20)',
    },
    captureMiddleRingBusy: {
      borderColor: 'rgba(120, 120, 120, 0.84)',
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
    },
    captureCore: {
      width: 68,
      height: 68,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: staticColors.white,
    },
    captureButtonPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    captureButtonBusy: {
      opacity: 0.94,
      transform: [{ scale: 0.965 }],
    },
    captureCoreBusy: {
      backgroundColor: staticColors.grey,
    },
    textActionPressable: {
      borderRadius: radius.pill,
    },
    textActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderCurve: 'continuous',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.16)',
    },
    textActionLabel: {
      ...typography.titleMedium,
      color: staticColors.white,
    },
    sendActionPressable: {
      borderRadius: radius.pill,
    },
    sendActionButton: {
      width: 74,
      height: 74,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: staticColors.white,
      boxShadow: theme.shadow.floating,
    },
    cropToolbarButtonPressable: {
      borderRadius: radius.pill,
    },
    cropToolbarButton: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: staticColors.transparent,
    },
    cropDonePressable: {
      borderRadius: radius.pill,
    },
    cropDoneButton: {
      minWidth: 126,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: '#1396FF',
    },
    cropDoneLabel: {
      ...typography.titleMedium,
      color: staticColors.white,
    },
    cropShade: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.54)',
    },
    cropRect: {
      position: 'absolute',
    },
    cropRectBorder: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderWidth: 1.5,
      borderColor: staticColors.white,
    },
    cropGridVerticalLeft: {
      position: 'absolute',
      top: 1,
      bottom: 1,
      left: '33.333%',
      width: 1,
      marginLeft: -0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
    },
    cropGridVerticalRight: {
      position: 'absolute',
      top: 1,
      bottom: 1,
      left: '66.666%',
      width: 1,
      marginLeft: -0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
    },
    cropGridHorizontalTop: {
      position: 'absolute',
      top: '33.333%',
      right: 1,
      left: 1,
      height: 1,
      marginTop: -0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
    },
    cropGridHorizontalBottom: {
      position: 'absolute',
      top: '66.666%',
      right: 1,
      left: 1,
      height: 1,
      marginTop: -0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
    },
    cropMoveSurface: {
      position: 'absolute',
      top: 24,
      right: 24,
      bottom: 24,
      left: 24,
    },
    cropEdgeTouchArea: {
      position: 'absolute',
      zIndex: 1,
    },
    cropEdgeTop: {
      top: -10,
      right: 22,
      left: 22,
      height: 20,
    },
    cropEdgeRight: {
      top: 22,
      right: -10,
      bottom: 22,
      width: 20,
    },
    cropEdgeBottom: {
      right: 22,
      bottom: -10,
      left: 22,
      height: 20,
    },
    cropEdgeLeft: {
      top: 22,
      bottom: 22,
      left: -10,
      width: 20,
    },
    cropHandleTouchArea: {
      position: 'absolute',
      width: 48,
      height: 48,
      zIndex: 2,
    },
    cropHandleTop: {
      top: -10,
    },
    cropHandleBottom: {
      bottom: -10,
    },
    cropHandleLeft: {
      left: -10,
    },
    cropHandleRight: {
      right: -10,
    },
    cropHandleHorizontal: {
      position: 'absolute',
      width: 30,
      height: 3,
      backgroundColor: staticColors.white,
    },
    cropHandleHorizontalLeft: {
      left: 10,
    },
    cropHandleHorizontalRight: {
      right: 10,
    },
    cropHandleHorizontalTop: {
      top: 10,
    },
    cropHandleHorizontalBottom: {
      bottom: 10,
    },
    cropHandleVertical: {
      position: 'absolute',
      width: 3,
      height: 30,
      backgroundColor: staticColors.white,
    },
    cropHandleVerticalLeft: {
      left: 10,
    },
    cropHandleVerticalRight: {
      right: 10,
    },
    cropHandleVerticalTop: {
      top: 10,
    },
    cropHandleVerticalBottom: {
      bottom: 10,
    },
    controlPressed: {
      opacity: 0.88,
    },
    controlDisabled: {
      opacity: 0.5,
    },
  });
}
