import '@testing-library/jest-dom';
import {cleanup} from '@testing-library/react';

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(cleanup);

// mocks window.watchMedia for useMediaQuery
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query as unknown,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
