// jsdom does not implement ResizeObserver, which OpenLayers uses to track the
// map viewport size. Provide a no-op so map components can mount under Vitest.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
