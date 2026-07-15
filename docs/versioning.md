# Versioning and releases

`package.json` sits at `0.0.0`. Snapshots never change it. The one thing that
changes it is cutting a real release, where `npm version` sets the release number the
standard npm way (see [Real releases](#real-releases-latest-tag)). There is no automated
version-bump commit and no version-bump PR.

## Snapshots (`dev` tag)

Every push to `main` publishes a snapshot to Nexus under the `dev` tag (see
[`.github/workflows/on-push.yml`](../.github/workflows/on-push.yml)). This is how apps
track the newest build.

- CI runs first (lint, format, type-check, test, build). Only if it passes does the
  snapshot publish.
- The workflow gives each snapshot a unique version by appending `-dev-<hash>` to the base
  `0.0.0`: `0.0.0-dev-<hash>`, e.g. `0.0.0-dev-1a2b3c4`. Because each version is unique,
  there is never a stale-cache or re-publish problem.
- The `dev` tag always points at the newest snapshot.

Apps opt in by depending on the `dev` tag and moving forward with `npm update` - see
["Use the newest build" in the README](../README.md#use-the-newest-build). An app pins the
exact snapshot it resolved in its own `package-lock.json`, so `npm ci` stays reproducible;
the tag only decides what `npm update` pulls forward.

Old `-development-` snapshots accumulate on every push, so Nexus should prune them on a
retention policy (like Maven `-SNAPSHOT`). Keep them long enough to cover how far back you
rebuild `main`.

## Real releases (`latest` tag)

Releases follow the standard npm/GitHub flow (see
[`.github/workflows/on-release-published.yml`](../.github/workflows/on-release-published.yml)
and the
[GitHub tutorial](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages)).
To cut a release:

1. Set the version and tag it, the normal npm way:

   ```bash
   npm version 0.2.0   # writes 0.2.0 into package.json and creates the git tag v0.2.0
   git push --follow-tags
   ```

2. Create a GitHub Release from that `v0.2.0` tag (its notes are the changelog).

Publishing the Release runs the workflow: `npm ci`, build, `npm publish`. The version is
whatever `package.json` holds at the tagged commit - there is no version step in CI and
nothing is committed back. As a guard, the workflow fails if `package.json` and the release
tag disagree, so a Release cut from the GitHub UI without running `npm version` first can
never publish the wrong number. `npm publish` ships it to the default `latest` tag, so apps
can pin an exact release (`@aerius/vue-geo-components@0.2.0`).

Note: `npm version` moves `package.json` off `0.0.0` to the released number, which is the
standard behaviour. Snapshots are unaffected - the snapshot job always publishes
`0.0.0-dev-<hash>` regardless of what `package.json` says.

## Infra needed before the first publish

- The npm repository on Nexus (`https://nexus.aerius.nl/repository/npm/`). The registry URL
  is configurable via the `NEXUS_REGISTRY` repo/org **variable**; set it only if the path
  differs from that default.
- A dedicated Nexus CI account (not a personal login) with publish rights, and a token for
  it stored as the `NEXUS_TOKEN` secret on the **upstream** repo
  (`aerius/vue-geo-components`). `actions/setup-node` wires it up as `NODE_AUTH_TOKEN`.
- Publishing runs only on the upstream repo. Forks run CI but never publish, so no secret
  is needed on a fork.
- A Nexus cleanup policy that prunes old snapshot versions (see above).
