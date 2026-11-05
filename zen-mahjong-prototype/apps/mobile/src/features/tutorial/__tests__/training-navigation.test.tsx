import { fireEvent, render } from '@testing-library/react-native';
import {
  createConcentrationSession,
  createFixtureState,
  executeConcentrationCommand,
} from '@zen-mahjong/game-engine';
import { router } from 'expo-router';
import { defaultOnboardingState, type OnboardingStateV1 } from '../../../state/onboarding';
import { TrainingScreen } from '../training-screen';

let mockOnboarding: OnboardingStateV1;
const mockUpdateOnboarding = jest.fn((patch) => {
  mockOnboarding = { ...mockOnboarding, ...patch };
});
jest.mock('../../../state/app-data-provider', () => ({
  useAppData: () => ({
    onboarding: mockOnboarding,
    settings: { reducedMotion: true },
    updateOnboarding: mockUpdateOnboarding,
  }),
}));
jest.mock('../../../components/app-screen', () => ({
  AppScreen: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn() } }));
jest.mock('lucide-react-native', () => ({ Lightbulb: () => null, Menu: () => null }));
jest.mock('@zen-mahjong/mahjong-ui', () => ({
  MahjongBoard: () => null,
  ConcentrationTray: () => null,
  getTileMotif: (id: string) => ({ id, label: id }),
}));

describe('training navigation lifecycle', () => {
  it.each(['tutorial', 'practice'] as const)('does not recreate %s after finishing', (mode) => {
    jest.clearAllMocks();
    let session = createConcentrationSession({
      activeSince: null,
      category: 'normal',
      game: createFixtureState('flat-introduction'),
      levelContentVersion: '0.3.0-training',
      levelNumber: 1,
      sessionId: mode,
      startedAt: '2026-10-11T00:00:00.000Z',
    });
    for (const tileId of ['lotus-left', 'lotus-right', 'bamboo-left', 'bamboo-right']) {
      const result = executeConcentrationCommand(session, { tileId, type: 'select-board-tile' });
      expect(result.accepted).toBe(true);
      session = result.session;
    }
    mockOnboarding = {
      ...defaultOnboardingState,
      activeTraining: { mode, session },
      tutorialCompletedAt: mode === 'practice' ? session.startedAt : null,
    };
    const screen = render(<TrainingScreen mode={mode} />);
    fireEvent.press(
      screen.getByLabelText(mode === 'practice' ? 'Start level one' : 'Continue to practice'),
    );
    expect(router.replace).toHaveBeenCalledWith(mode === 'practice' ? '/game' : '/practice');
    screen.rerender(<TrainingScreen mode={mode} />);
    expect(mockOnboarding.activeTraining).toBeNull();
    expect(mockUpdateOnboarding).toHaveBeenCalledTimes(1);
  });
});
