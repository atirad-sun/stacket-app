import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataBoundary, type DataState } from '@/primitives/data-boundary';

function Fixture({ state }: { state: DataState<string[]> }) {
  return (
    <DataBoundary
      state={state}
      skeleton={<div data-testid="skeleton" />}
      empty={<div>ยังไม่มีการ์ดในพอร์ต</div>}
    >
      {(data) => <ul>{data.map((d) => <li key={d}>{d}</li>)}</ul>}
    </DataBoundary>
  );
}

describe('DataBoundary', () => {
  it('renders the caller-supplied skeleton while loading', () => {
    render(<Fixture state={{ status: 'loading' }} />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('announces loading to assistive technology', () => {
    render(<Fixture state={{ status: 'loading' }} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('กำลังโหลด')).toBeInTheDocument();
  });

  it('renders the caller-supplied empty state', () => {
    render(<Fixture state={{ status: 'empty' }} />);
    expect(screen.getByText('ยังไม่มีการ์ดในพอร์ต')).toBeInTheDocument();
  });

  it('renders the error cause and a working retry', async () => {
    const retry = vi.fn();
    render(<Fixture state={{ status: 'error', message: 'เชื่อมต่อไม่สำเร็จ', retry }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('เชื่อมต่อไม่สำเร็จ');
    expect(screen.getByRole('button', { name: 'ลองอีกครั้ง' })).toHaveAttribute('type', 'button');
    await userEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('explains the offline state rather than failing silently', () => {
    render(<Fixture state={{ status: 'offline' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('ออฟไลน์');
  });

  it('renders children when ready', () => {
    render(<Fixture state={{ status: 'ready', data: ['Charizard'] }} />);
    expect(screen.getByText('Charizard')).toBeInTheDocument();
  });
});
