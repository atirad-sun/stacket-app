import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/cn';

describe('test harness', () => {
  it('resolves the @ alias and merges class names', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
