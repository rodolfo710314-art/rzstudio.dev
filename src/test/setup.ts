import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de IntersectionObserver para Framer Motion
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
