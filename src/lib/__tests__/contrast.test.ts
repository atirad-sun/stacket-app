import { describe, it, expect } from 'vitest';
import { contrastRatio, relativeLuminance } from '@/lib/contrast';

describe('contrast', () => {
  it('computes luminance at the extremes', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });

  it('gives 21:1 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
  });

  it('is order independent', () => {
    expect(contrastRatio('#00A98A', '#FFFFFF')).toBeCloseTo(
      contrastRatio('#FFFFFF', '#00A98A'), 6,
    );
  });

  it('reproduces the audited value for brand teal on white', () => {
    expect(contrastRatio('#00A98A', '#FFFFFF')).toBeCloseTo(2.98, 1);
  });

  it('accepts shorthand hex', () => {
    expect(contrastRatio('#000', '#FFF')).toBeCloseTo(21, 2);
  });
});
