# Mahjong UI

Reusable React Native presentation components for Mahjong experiences.

## Components

- `MahjongTile` renders accessible available, blocked, selected, hinted, and disabled states with optional reduced motion.
- `MahjongBoard` positions tiles from row, column, and layer coordinates while remaining independent from the game engine.

Applications adapt their domain state into `MahjongBoardTile` values and keep matching or availability rules outside this package.
