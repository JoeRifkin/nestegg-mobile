import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RateStepper } from '../src/components/RateStepper';

jest.mock('expo-haptics', () => ({ selectionAsync: jest.fn(() => Promise.resolve()) }));

describe('RateStepper', () => {
  it('shows the rate as a whole percent', () => {
    render(<RateStepper value={0.06} onChange={jest.fn()} />);
    expect(screen.getByTestId('rate-value')).toHaveTextContent('6%');
  });

  it('steps up and down by one percent', () => {
    const onChange = jest.fn();
    render(<RateStepper value={0.06} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('rate-increment'));
    expect(onChange).toHaveBeenLastCalledWith(0.07);
    fireEvent.press(screen.getByTestId('rate-decrement'));
    expect(onChange).toHaveBeenLastCalledWith(0.05);
  });

  it('does not go below the minimum', () => {
    const onChange = jest.fn();
    render(<RateStepper value={0} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('rate-decrement'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
