import { getCoverCrop, getResponsivePhoneMetrics } from '../responsive';

describe('responsive presentation helpers', () => {
  it('uses the approved compact and standard phone gutters', () => {
    expect(getResponsivePhoneMetrics(360)).toMatchObject({ gutter: 16, contentWidth: 328 });
    expect(getResponsivePhoneMetrics(390)).toMatchObject({ gutter: 24, contentWidth: 342 });
    expect(getResponsivePhoneMetrics(430)).toMatchObject({ gutter: 24, contentWidth: 382 });
  });

  it('caps phone composition width without breaking wider functional layouts', () => {
    expect(getResponsivePhoneMetrics(768)).toMatchObject({
      viewportWidth: 768,
      contentWidth: 382,
      referenceScale: 430 / 390,
    });
  });

  it('calculates a centered cover crop without stretching', () => {
    const crop = getCoverCrop(941, 1672, 390, 844);

    expect(crop.renderedWidth).toBeCloseTo(475.0024);
    expect(crop.renderedHeight).toBe(844);
    expect(crop.x).toBeCloseTo(-42.5012);
    expect(crop.y).toBe(0);
  });

  it('returns an empty crop for invalid dimensions', () => {
    expect(getCoverCrop(0, 1672, 390, 844)).toEqual({
      renderedWidth: 0,
      renderedHeight: 0,
      x: 0,
      y: 0,
    });
  });
});
