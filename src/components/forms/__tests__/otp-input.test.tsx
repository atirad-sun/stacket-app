import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OTPInput } from '@/components/forms/otp-input';

describe('OTPInput', () => {
  it('renders `length` cells', () => {
    render(<OTPInput value="12" length={6} />);
    expect(screen.getAllByRole('presentation')).toHaveLength(6);
  });

  it('shows entered digits in the filled cells with tabular-nums, blanks the rest', () => {
    render(<OTPInput value="12" length={6} />);
    const cells = screen.getAllByRole('presentation');
    expect(cells[0]).toHaveTextContent('1');
    expect(cells[0]).toHaveClass('text-numeric');
    expect(cells[1]).toHaveTextContent('2');
    expect(cells[2]).toHaveTextContent('');
  });

  it('exposes the current entry to assistive tech as a single accessible value', () => {
    render(<OTPInput value="12" length={6} />);
    expect(screen.getByLabelText('รหัส OTP ที่กรอกแล้ว 1 2')).toBeInTheDocument();
  });
});
