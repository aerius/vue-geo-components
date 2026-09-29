import Map from "ol/Map.js";
import View from "ol/View.js";
import ViewHint from "ol/ViewHint.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMapFlyTo } from "@/map/flyTo";

const SIZED = { getSize: () => [800, 600] } as unknown as Map;
const TARGET = { center: [81403, 458200], zoom: 10 };

let frames: [number, FrameRequestCallback][] = [];
let nextFrameId = 0;
let now = 0;

// Runs queued animation frames until none are left, 16ms apart.
function runFrames(limit = 1000): void {
  for (let i = 0; i < limit && frames.length > 0; i++) {
    now += 16;
    const queued = frames;
    frames = [];
    queued.forEach(([, frame]) => frame(now));
  }
}

function interactingHint(view: View): number {
  return view.getHints()[ViewHint.INTERACTING]!;
}

beforeEach(() => {
  frames = [];
  now = 0;
  vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
    frames.push([++nextFrameId, frame]);
    return nextFrameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    frames = frames.filter(([queued]) => queued !== id);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createMapFlyTo", () => {
  it("holds the interacting hint for the whole flight", () => {
    const view = new View({ center: [155000, 463000], zoom: 3 });
    createMapFlyTo(view, SIZED).flyTo(TARGET);
    runFrames(3);

    expect(view.getInteracting(), "The hint should survive the flight's own setCenter calls").toBe(true);

    runFrames();

    expect(view.getCenter()![0], "The flight should land on the target").toBeCloseTo(TARGET.center[0]!);
    expect(view.getCenter()![1], "The flight should land on the target").toBeCloseTo(TARGET.center[1]!);
    expect(interactingHint(view), "The hint should be released once the flight lands").toBe(0);
  });

  it("releases the hint when the flight is cancelled", () => {
    const view = new View({ center: [155000, 463000], zoom: 3 });
    const flight = createMapFlyTo(view, SIZED);
    flight.flyTo(TARGET);
    runFrames(3);

    flight.cancel();

    expect(interactingHint(view), "Cancelling should give the hint back").toBe(0);
  });

  it("holds one hint when a new flight replaces a running one", () => {
    const view = new View({ center: [155000, 463000], zoom: 3 });
    const flight = createMapFlyTo(view, SIZED);
    flight.flyTo(TARGET);
    runFrames(3);

    flight.flyTo({ center: [200000, 500000], zoom: 8 });

    expect(interactingHint(view), "The replaced flight should hand its hint back").toBe(1);
    runFrames();
    expect(interactingHint(view), "The hint should be released once the new flight lands").toBe(0);
  });

  it("stays balanced when the user drags during a flight", () => {
    const view = new View({ center: [155000, 463000], zoom: 3 });
    createMapFlyTo(view, SIZED).flyTo(TARGET);
    runFrames(3);

    // What DragPan does around a drag.
    view.beginInteraction();
    runFrames();
    view.endInteraction();

    expect(interactingHint(view), "The flight and the drag should each give back their own hint").toBe(0);
  });

  it("does not take the hint when the view is already there", () => {
    const view = new View({ center: TARGET.center, zoom: TARGET.zoom });
    createMapFlyTo(view, SIZED).flyTo(TARGET);

    expect(interactingHint(view), "A flight that does not start should not hold the hint").toBe(0);
  });

  it("fires moveend once, when the flight lands", () => {
    const view = new View({ center: [155000, 463000], zoom: 3 });
    const map = new Map({ target: document.createElement("div"), view, controls: [], interactions: [] });
    map.setSize([800, 600]);
    map.renderSync();
    let moveends = 0;
    map.on("moveend", () => moveends++);

    createMapFlyTo(view, map).flyTo(TARGET);
    runFrames();

    expect(moveends, "A flight should end in a single moveend").toBe(1);
  });
});
