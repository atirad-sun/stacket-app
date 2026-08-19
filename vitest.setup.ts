import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';

// vitest-axe ships its type augmentation under the legacy `Vi` namespace
// (see node_modules/vitest-axe/dist/extend-expect.d.ts), which vitest 2.x
// does not read. Re-declare it the way @testing-library/jest-dom/types/vitest.d.ts
// does (declare module 'vitest', default type param `T = any`) — matching that
// default exactly matters, since two augmentations of the same interface with
// different defaults ("must have identical type parameters") fail to merge.
declare module 'vitest' {
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend(matchers);
afterEach(() => cleanup());
