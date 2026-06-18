// =============================================================================
// Vitest Global setup — runs before every test file
// =============================================================================
// Pulls in @testing-library/jest-dom custom matchers (toBeInTheDocument, etc.)
// and installs global browser-API mocks that jsdom doesn't ship.
//
// NOTE: this file is .tsx because the next/link & next/image mocks below return
// JSX. Vitest compiles it transparently through @vitejs/plugin-react.
// =============================================================================

import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React components after each test to keep the DOM clean.
afterEach(() => {
  cleanup()
})

// ─── jsdom polyfills ───────────────────────────────────────────────────────
// jsdom doesn't implement a few APIs that components touch; stub them out
// so importing the component tree doesn't blow up in tests.

// matchMedia — used by next-themes and various responsive hooks
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),        // deprecated API still used by some libs
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

// IntersectionObserver — used by lazy-loaded image components & infinite scroll
class IntersectionObserverMock {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
if (!('IntersectionObserver' in window)) {
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
  })
}
if (!('IntersectionObserver' in globalThis)) {
  ;(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    IntersectionObserverMock
}

// ResizeObserver — used by recharts / react-resizable-panels
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
if (!('ResizeObserver' in window)) {
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  })
}
if (!('ResizeObserver' in globalThis)) {
  ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverMock
}

// Pointer / scroll APIs sometimes referenced by Radix primitives
if (!('scrollTo' in window)) {
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    configurable: true,
    value: vi.fn(),
  })
}

// ─── Next.js navigation mock ───────────────────────────────────────────────
// The real `next/navigation` router only works inside a request scope; tests
// import client components that read the hook, so we hand back a stable stub.

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

// ─── next/image mock — render a plain <img> so tests can use alt text ──────
vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string } & Record<string, unknown>) => {
    const { src, alt, ...rest } = props
    return <img src={typeof src === 'string' ? src : ''} alt={alt} {...rest} />
  },
}))

// ─── next-themes mock — avoids hydration / context churn in unit tests ─────
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
    resolvedTheme: 'light',
    themes: ['light', 'dark'],
    systemTheme: 'light',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
