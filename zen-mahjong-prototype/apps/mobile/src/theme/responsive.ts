import { layout, spacing } from '@zen-mahjong/design-tokens';

export const approvedPhoneWidths = [360, 390, 412, 430] as const;

export interface ResponsivePhoneMetrics {
  contentWidth: number;
  gutter: number;
  referenceScale: number;
  viewportWidth: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getResponsivePhoneMetrics(viewportWidth: number): ResponsivePhoneMetrics {
  const boundedWidth = clamp(viewportWidth, layout.phoneMinimumWidth, layout.phoneMaximumWidth);
  const gutter = boundedWidth < layout.phoneReferenceWidth ? spacing.lg : spacing.xl;

  return {
    viewportWidth,
    gutter,
    contentWidth: Math.max(0, Math.min(viewportWidth, layout.phoneMaximumWidth) - gutter * 2),
    referenceScale: boundedWidth / layout.phoneReferenceWidth,
  };
}

export interface CoverCrop {
  renderedHeight: number;
  renderedWidth: number;
  x: number;
  y: number;
}

export function getCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  containerWidth: number,
  containerHeight: number,
): CoverCrop {
  if (sourceWidth <= 0 || sourceHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return { renderedWidth: 0, renderedHeight: 0, x: 0, y: 0 };
  }

  const scale = Math.max(containerWidth / sourceWidth, containerHeight / sourceHeight);
  const renderedWidth = sourceWidth * scale;
  const renderedHeight = sourceHeight * scale;

  return {
    renderedWidth,
    renderedHeight,
    x: (containerWidth - renderedWidth) / 2,
    y: (containerHeight - renderedHeight) / 2,
  };
}
