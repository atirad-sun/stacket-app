import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stepper } from '@/components/progress/stepper';

describe('Stepper', () => {
  it('renders the step count as text', () => {
    render(<Stepper totalSteps={3} currentStep={1} />);
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('renders one segment per step and marks the completed ones', () => {
    render(<Stepper totalSteps={3} currentStep={2} />);
    const segments = screen.getAllByRole('presentation');
    expect(segments).toHaveLength(3);
    expect(segments[0]).toHaveClass('bg-primary');
    expect(segments[1]).toHaveClass('bg-primary');
    expect(segments[2]).not.toHaveClass('bg-primary');
  });

  it('exposes progress to assistive technology via a progressbar role', () => {
    render(<Stepper totalSteps={3} currentStep={2} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(bar).toHaveAttribute('aria-valuemax', '3');
  });
});
