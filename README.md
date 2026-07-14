# @aerius/vue-geo-components

Shared Vue 3 + OpenLayers geo components for AERIUS. Used by
[GRIP](https://github.com/aerius/GRIP) (NL Monitor) and Archive. Both apps use the same
stack: Vue 3, Vite, TypeScript, OpenLayers 10, proj4, and Pinia.

The library is built with Vite and ships as ESM. `ol`, `vue`, `proj4`, and `pinia` are
peer dependencies: the library does not bundle them, it uses the app's own copies.

> Status: starting point. This repo sets up the build, tooling, and CI. The real map code
> comes in a follow-up. The `MapView` component and `RD` helper here are a small working
> example.

## Use it in an app

**1. Point npm at Nexus for the `@aerius` scope.** Add this line to the app's `.npmrc`:

```
@aerius:registry=https://nexus.aerius.nl/repository/npm/
```

(If reads need a login, run
`npm login --scope=@aerius --registry=https://nexus.aerius.nl/repository/npm/` once.)

**2. Install it**, plus the peer dependencies if the app doesn't already have them:

```bash
npm install @aerius/vue-geo-components
npm install ol vue proj4 pinia
```

**3. Use it:**

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

## Use the newest build

Say Archive uses this library and you want to always work against the latest version.
There are two cases. The difference is live vs. on-demand:

**You are editing the library too.** Use yalc: your local library changes show up in the
app the moment you save - live, with nothing to run and no publishing at all. This is the
fastest loop. See [docs/local-development.md](./docs/local-development.md).

**You just want the newest published build** (you're not editing the library). Depend on
the `dev` tag. This is an on-demand pull, not a live link: the app stays on whatever is in
its lockfile and only moves when you run `npm update` - it never changes under you
mid-session. In the app's `package.json`:

```json
"@aerius/vue-geo-components": "dev"
```

Every push to this library's `main` publishes a new `dev` snapshot. To pull the newest one
into the app:

```bash
npm update @aerius/vue-geo-components
```

Each snapshot has a unique version, so this always works cleanly. (A plain `npm install`
keeps whatever is locked in `package-lock.json`, so use `npm update` to move forward.)

**Deploying the newest dev automatically (e.g. a nightly).** CI floats to the latest dev on
its own - no commit, no human:

```bash
npm ci                                 # locked, reproducible base for everything else
npm update @aerius/vue-geo-components   # bump just this library to the newest dev
npm run build
```

The lockfile change from `npm update` is thrown away with the CI runner, so nothing is
committed. A production or release deploy leaves out the `npm update` line (or builds from a
release branch pinned to a real version), so it ships an exact, frozen build.

## Pin a released version

For a stable build (e.g. on a GRIP/Archive release branch), depend on a real release
number instead of the `dev` tag:

```bash
npm install @aerius/vue-geo-components@0.2.0
```

Commit `package.json` and `package-lock.json`. The committed lockfile is what makes the
build reproducible; a `^0.2.0` range still pins exact bytes via the lockfile and only lets
`npm update` move within `0.2.x`.

## Develop this library

Use Node 24 (see [`.nvmrc`](./.nvmrc)).

```bash
npm install
npm run dev          # rebuild on every save
npm run lint
npm run type-check
npm test
npm run build        # type-check + build dist/
```

- **Work on it against GRIP / Archive:** [docs/local-development.md](./docs/local-development.md)
- **Releasing and versioning:** [docs/versioning.md](./docs/versioning.md)

## What it exports

Everything comes from [`src/index.ts`](./src/index.ts):

| Export                                           | What it is                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| `MapView`                                        | The OpenLayers map as a Vue component. Shares the map with child components. |
| `useMap` / `provideMap` / `mapInjectionKey`      | Get or share the map instance.                                               |
| `RD` / `registerRdProjection` / `isRdRegistered` | Dutch RD map projection (EPSG:28992).                                        |
| `useMapViewStore`                                | Shared map state (center, zoom).                                             |

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).
