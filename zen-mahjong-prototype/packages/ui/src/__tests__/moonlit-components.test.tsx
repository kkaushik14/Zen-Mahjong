import { fireEvent, render } from '@testing-library/react-native';

import { ActionButton } from '../action-button';
import { IconActionControl } from '../icon-action-control';
import { ModalShell } from '../modal-shell';
import { MoonlitSwitch } from '../moonlit-switch';
import { SettingRow } from '../setting-row';
import { ZenProgress } from '../zen-progress';

describe('V3-14 Moonlit components', () => {
  it('runs available button actions and blocks busy actions', () => {
    const onPress = jest.fn();
    const { getByLabelText, rerender } = render(
      <ActionButton accessibilityLabel="Continue" label="Continue" onPress={onPress} />,
    );

    fireEvent.press(getByLabelText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(
      <ActionButton accessibilityLabel="Continue" label="Continue" loading onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getByLabelText('Continue').props.accessibilityState).toEqual({
      busy: true,
      disabled: true,
    });
  });

  it('exposes a native switch contract and toggles once', () => {
    const onValueChange = jest.fn();
    const { getByLabelText } = render(
      <MoonlitSwitch accessibilityLabel="Ambient sound" onValueChange={onValueChange} value />,
    );

    fireEvent.press(getByLabelText('Ambient sound'));
    expect(onValueChange).toHaveBeenCalledWith(false);
    expect(getByLabelText('Ambient sound').props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
    });
  });

  it('keeps an entire settings row as one accessible toggle target', () => {
    const onValueChange = jest.fn();
    const { getByLabelText } = render(
      <SettingRow label="Haptics" onValueChange={onValueChange} value={false} />,
    );

    fireEvent.press(getByLabelText('Haptics'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('disables zero-balance gameplay actions', () => {
    const onPress = jest.fn();
    const { getByLabelText, getByText } = render(
      <IconActionControl
        accessibilityLabel="Shuffle unavailable"
        onPress={onPress}
        state="zero"
        type="shuffle"
      />,
    );

    fireEvent.press(getByLabelText('Shuffle unavailable'));
    expect(onPress).not.toHaveBeenCalled();
    expect(getByText('0')).toBeTruthy();
  });

  it('keeps modal copy and actions as native content', () => {
    const { getByLabelText, getByText } = render(
      <ModalShell
        accessibilityLabel="Pause dialog"
        actions={
          <ActionButton accessibilityLabel="Resume" label="Resume" onPress={() => undefined} />
        }
        body="Your garden is waiting."
        title="A quiet pause"
      />,
    );

    expect(getByLabelText('Pause dialog')).toBeTruthy();
    expect(getByText('A quiet pause')).toBeTruthy();
    expect(getByText('Your garden is waiting.')).toBeTruthy();
    expect(getByLabelText('Resume')).toBeTruthy();
  });

  it('caps visual progress while preserving an above-limit score', () => {
    const { getByLabelText, getByText } = render(
      <ZenProgress accessibilityLabel="22 Zen Score" value={22} />,
    );

    expect(getByLabelText('22 Zen Score').props.accessibilityValue).toEqual({
      max: 20,
      min: 0,
      now: 22,
    });
    expect(getByLabelText('Zen Score exceeds 20')).toBeTruthy();
    expect(getByText('22')).toBeTruthy();
  });
});
