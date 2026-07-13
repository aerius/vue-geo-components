import { get as getProjection } from "ol/proj";
import { register } from "ol/proj/proj4";
import proj4 from "proj4";

/** Amersfoort / RD New - the Dutch national projection used across AERIUS. */
export const RD = "EPSG:28992";

const RD_DEFINITION =
  "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 " +
  "+k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel " +
  "+towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs";

let registered = false;

/**
 * Register the RD (EPSG:28992) projection with proj4 and OpenLayers.
 * Safe to call more than once; only the first call does work.
 */
export function registerRdProjection(): void {
  if (registered) {
    return;
  }
  proj4.defs(RD, RD_DEFINITION);
  register(proj4);
  registered = true;
}

/** Returns true once {@link registerRdProjection} has made RD available to OpenLayers. */
export function isRdRegistered(): boolean {
  return registered && getProjection(RD) !== null;
}
