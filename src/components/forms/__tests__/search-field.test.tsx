import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from '@/components/forms/search-field';

describe('SearchField', () => {
  it('renders the placeholder and current value', () => {
    render(<SearchField value="Charizard" onChange={vi.fn()} placeholder="ค้นหาการ์ด, เซ็ต, หรือผู้เล่น" />);
    expect(screen.getByRole('searchbox')).toHaveValue('Charizard');
    expect(screen.getByPlaceholderText('ค้นหาการ์ด, เซ็ต, หรือผู้เล่น')).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const onChange = vi.fn();
    render(<SearchField value="" onChange={onChange} placeholder="p" />);
    await userEvent.type(screen.getByRole('searchbox'), 'C');
    expect(onChange).toHaveBeenCalledWith('C');
  });

  it('shows a clear button only when there is a value, and clearing empties it', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchField value="" onChange={onChange} placeholder="p" />);
    expect(screen.queryByRole('button', { name: 'ล้างการค้นหา' })).toBeNull();
    rerender(<SearchField value="Charizard" onChange={onChange} placeholder="p" />);
    await userEvent.click(screen.getByRole('button', { name: 'ล้างการค้นหา' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('calls onSubmit on Enter', async () => {
    const onSubmit = vi.fn();
    render(<SearchField value="Charizard" onChange={vi.fn()} placeholder="p" onSubmit={onSubmit} />);
    screen.getByRole('searchbox').focus();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
