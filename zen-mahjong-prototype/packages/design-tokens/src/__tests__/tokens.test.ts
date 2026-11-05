import { fontFamily, resolveMotionDuration, typography } from '../index';

describe('v3 presentation tokens', () => {
  it('uses stable bundled font aliases', () => {
    expect(typography.headingMedium.fontFamily).toBe(fontFamily.display);
    expect(typography.body.fontFamily).toBe(fontFamily.body);
  });

  it('removes decorative timing when Reduced Motion is enabled', () => {
    expect(resolveMotionDuration('screenMs', true)).toBe(0);
    expect(resolveMotionDuration('screenMs', false)).toBe(360);
  });
});
