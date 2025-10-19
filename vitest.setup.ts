import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

// Mock next-cloudinary CldImage to a simple img for tests
vi.mock('next-cloudinary', () => ({
  CldImage: (props: Record<string, unknown>) => {
    const src = typeof props.src === 'string' ? props.src : '';
    const alt = typeof props.alt === 'string' ? props.alt : '';
    return React.createElement('img', { alt, src, ...props });
  },
}));

// Mock convex/react hooks
vi.mock('convex/react', async () => {
  const actual = (await vi.importActual('convex/react')) as Record<string, unknown>;
  return {
    ...actual,
    useAction: vi.fn(() => vi.fn()),
    useMutation: vi.fn(() => vi.fn()),
  } as Record<string, unknown>;
});
