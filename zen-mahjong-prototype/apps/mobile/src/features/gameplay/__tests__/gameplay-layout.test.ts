import { getGameplayLayoutMetrics } from '../gameplay-layout';

describe('Gameplay layout', () => {
  it.each([
    [360, 800, 328, 328, 440, 578, 666],
    [390, 844, 358, 342, 482, 620, 708],
    [412, 915, 380, 342, 553, 691, 779],
    [430, 932, 398, 342, 570, 708, 796],
  ])(
    'matches the approved %sx%s gameplay composition',
    (width, height, contentWidth, trayWidth, boardHeight, trayTop, dockTop) => {
      expect(getGameplayLayoutMetrics(width, height)).toMatchObject({
        boardHeight,
        boardTop: 120,
        contentWidth,
        dockTop,
        left: 0,
        shellWidth: width,
        trayTop,
        trayWidth,
      });
    },
  );

  it('centers and caps the phone composition on a wider viewport', () => {
    expect(getGameplayLayoutMetrics(760, 932)).toMatchObject({
      contentWidth: 398,
      left: 165,
      shellWidth: 430,
      trayWidth: 342,
    });
  });
});
