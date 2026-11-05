import { fireEvent, render } from '@testing-library/react-native';
import { MahjongBoard, type MahjongBoardTile } from '../mahjong-board';

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: require('react-native').View },
}));
jest.mock('../mahjong-tile', () => ({
  MahjongTile: ({ accessibilityLabel, size }: { accessibilityLabel: string; size: number }) => {
    const { View } = require('react-native');
    return <View accessibilityLabel={accessibilityLabel} style={{ width: size }} />;
  },
}));

describe('board presentation stability', () => {
  it('keeps tile size when edge tiles disappear from a run', () => {
    const tiles: MahjongBoardTile[] = [0, 1, 2, 3].map((column) => ({
      accessibilityLabel: `Tile ${column}`,
      blockedReason: null,
      column,
      id: String(column),
      layer: 0,
      motif: 'lotus',
      row: 0,
      state: 'available',
    }));
    const screen = render(
      <MahjongBoard
        accessibilityLabel="Board"
        layoutTiles={tiles}
        onTilePress={jest.fn()}
        reducedMotion
        tiles={tiles}
      />,
    );
    fireEvent(screen.getByLabelText('Board'), 'layout', {
      nativeEvent: { layout: { height: 482, width: 240 } },
    });
    const initialSize = screen.getByLabelText('Tile 1').props.style.width;
    screen.rerender(
      <MahjongBoard
        accessibilityLabel="Board"
        layoutTiles={tiles}
        onTilePress={jest.fn()}
        reducedMotion
        tiles={tiles.slice(1, 3)}
      />,
    );
    expect(screen.getByLabelText('Tile 1').props.style.width).toBe(initialSize);
  });
});
