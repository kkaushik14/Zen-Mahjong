import { getHomeLayoutMetrics } from '../home-layout';

describe('Home layout', () => {
  it.each([
    [360, 800, 328, 312, 704],
    [390, 844, 358, 342, 721],
    [412, 915, 380, 364, 756.5],
    [430, 932, 398, 382, 765],
  ])(
    'matches the approved %sx%s composition',
    (width, height, contentWidth, primaryWidth, settingsTop) => {
      expect(getHomeLayoutMetrics(width, height)).toMatchObject({
        contentWidth,
        left: 0,
        primaryWidth,
        settingsTop,
        shellWidth: width,
      });
    },
  );

  it('centers and caps the phone composition on a wider viewport', () => {
    expect(getHomeLayoutMetrics(760, 932)).toMatchObject({
      contentWidth: 398,
      left: 165,
      primaryWidth: 382,
      shellWidth: 430,
    });
  });
});
