# @aerius/vue-geo-components

Shared Vue 3 + OpenLayers geo components for AERIUS. Used by
[GRIP](https://github.com/aerius/GRIP) (NL Monitor) and Archive. Both apps use the same
stack: Vue 3, Vite, TypeScript, OpenLayers 10, proj4, and Pinia.

The library is built with Vite and ships as ESM. `ol`, `vue`, `proj4`, and `pinia` are
peer dependencies: the library does not bundle them, it uses the app's own copies.

> Status: starting point. This repo sets up the build, tooling, and CI. The real map code
> comes in a follow-up. The `MapView` component and `RD` helper here are a small working
> example.

## Install

```bash
npm install @aerius/vue-geo-components
# peer dependencies, if the app doesn't have them yet:
npm install ol vue proj4 pinia
```

Set up npm to get `@aerius` packages from Nexus (see [`.npmrc`](./.npmrc)).

## Usage

```vue
<script setup lang="ts">
import { MapView } from "@aerius/vue-geo-components";
import "@aerius/vue-geo-components/style.css";
import "ol/ol.css";
</script>

<template>
  <MapView :zoom="7" style="height: 480px" />
</template>
```

`MapView` uses the Dutch RD map projection (EPSG:28992) by default. Child components can
get the map with `useMap()`.

## Develop

Needs Node 24 (see [`.nvmrc`](./.nvmrc)).

```bash
npm install
npm run dev          # rebuild on every save
npm run lint
npm run type-check
npm test
npm run build        # type-check + build dist/
```

- **Work on it against GRIP / Archive without publishing:** [docs/local-development.md](./docs/local-development.md)
- **Releasing and versioning:** [docs/versioning.md](./docs/versioning.md)

## What it exports

Everything comes from [`src/index.ts`](./src/index.ts):

| Export | What it is |
| --- | --- |
| `MapView` | The OpenLayers map as a Vue component. Shares the map with child components. |
| `useMap` / `provideMap` / `mapInjectionKey` | Get or share the map instance. |
| `RD` / `registerRdProjection` / `isRdRegistered` | Dutch RD map projection (EPSG:28992). |
| `useMapViewStore` | Shared map state (center, zoom). |

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).
