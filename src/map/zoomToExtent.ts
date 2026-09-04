import type { Extent } from "ol/extent.js";
import type Map from "ol/Map.js";
import type { Size } from "ol/size.js";
import type View from "ol/View.js";

import { extentCorners, sizeOf, type Corners } from "./extent";
import { mapFlightFor } from "./flyTo";

/** Zoom bounds for a fitted extent. */
const MIN_ZOOM = 3;
const MAX_ZOOM = 14;

/** Fraction of the viewport kept clear around a fitted extent. */
const VIEWPORT_PADDING = 0.1;
const EXTENT_PADDING = 0.2;

/** Extents smaller than this in either direction just go to {@link MAX_ZOOM}. */
const MIN_MEANINGFUL_EXTENT = 100;

const VIEWPORT_PADDING_FACTOR = 1 - VIEWPORT_PADDING * 2;

export type MapViewTarget = { center: [number, number]; zoom: number };

/** Set the map view to fit an extent once the map has a viewport size. */
export function zoomToExtentWhenMapIsSized(map: Map, extent: Extent): void {
  map.once("postrender", () => zoomToExtentWhenSized(map, extent));
  map.render();
}

/** Return the center and zoom needed to fit an extent within a viewport. */
export function mapViewForExtent(view: View, extent: Extent, size: Size | undefined): MapViewTarget | undefined {
  const viewport = sizeOf(size);
  const corners = extentCorners(extent);
  if (!viewport || !corners || viewport.width <= 0 || viewport.height <= 0) {
    return undefined;
  }

  const resolution = view.getResolutionForExtent(extent, [viewport.width * VIEWPORT_PADDING_FACTOR, viewport.height * VIEWPORT_PADDING_FACTOR]);
  const zoom = view.getZoomForResolution(resolution);
  if (zoom === undefined) {
    return undefined;
  }

  const constrainedZoom = view.getConstrainedZoom(zoom);
  if (constrainedZoom === undefined) {
    return undefined;
  }

  return { center: [(corners.minX + corners.maxX) / 2, (corners.minY + corners.maxY) / 2], zoom: constrainedZoom };
}

/**
 * Fly the map so a given extent fills the view, leaving a margin around it.
 *
 * Repeating the same extent is a no-op, so this is safe to call from a watcher
 * that fires more often than the target actually changes.
 *
 * Does nothing while the map has no viewport to fit into - a map in a hidden
 * container reports a size of zero, and there is no honest zoom for that. No
 * target is remembered either, so the next call once the map is laid out does
 * the real work.
 */
export function zoomToExtent(map: Map, extent: Extent): void {
  const view = map?.getView();
  const corners = extentCorners(extent);
  if (!map || !view || !corners) {
    return;
  }

  const size = sizeOf(map.getSize());
  if (!size || size.width <= 0 || size.height <= 0) {
    return;
  }

  const targetCenter = [(corners.minX + corners.maxX) / 2, (corners.minY + corners.maxY) / 2];
  const targetZoom = zoomForExtent(view, corners, size);
  if (!Number.isFinite(targetZoom)) {
    return;
  }

  mapFlightFor(map).flyTo({ center: targetCenter, zoom: targetZoom });
}

function zoomToExtentWhenSized(map: Map, extent: Extent): void {
  const target = mapViewForExtent(map.getView(), extent, map.getSize());
  if (!target) {
    map.once("change:size", () => zoomToExtentWhenSized(map, extent));
    return;
  }

  const view = map.getView();
  view.setCenter(target.center);
  view.setZoom(target.zoom);
}

function zoomForExtent(view: View, corners: Corners, size: { width: number; height: number }): number {
  const width = corners.maxX - corners.minX;
  const height = corners.maxY - corners.minY;

  if (width < MIN_MEANINGFUL_EXTENT || height < MIN_MEANINGFUL_EXTENT) {
    return MAX_ZOOM;
  }

  const padded: Extent = [
    corners.minX - width * EXTENT_PADDING,
    corners.minY - height * EXTENT_PADDING,
    corners.maxX + width * EXTENT_PADDING,
    corners.maxY + height * EXTENT_PADDING,
  ];
  const visible: [number, number] = [size.width * VIEWPORT_PADDING_FACTOR, size.height * VIEWPORT_PADDING_FACTOR];

  // Both extent and viewport are known to be non-degenerate by now, so this is
  // a real resolution - max(width / pixels, height / pixels) - not a maybe.
  const resolution = view.getResolutionForExtent(padded, visible);

  // ?? rather than ||: zoom 0 is a real zoom, and || would turn the widest
  // possible view into the narrowest one.
  return Math.max(Math.min(view.getZoomForResolution(resolution) ?? MAX_ZOOM, MAX_ZOOM), MIN_ZOOM);
}
