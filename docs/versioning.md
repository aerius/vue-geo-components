# Versioning and releases

There are two channels:

- **`latest`** - real releases with clean version numbers (`0.2.0`). For shipping.
- **`dev`** - a snapshot published on every push to `main`. For always tracking the
  newest build.

The **git tag is the source of truth** for the version. You never edit the version in
`package.json` by hand. When you cut a release, the Action publishes with that version and
then writes it back into `package.json` on `main`, so the repo always reflects the current
release. Before the first release, `package.json` sits at `0.0.0`.

## Real releases (`latest`)

To cut a release:

1. Make a GitHub Release with a tag like `v0.2.0` (cut from `main`). Write the release
   notes there (that is our changelog).
2. That's it. The release workflow (`.github/workflows/on-release-published.yml`) reads
   the tag, sets the version to `0.2.0`, builds, tests, and publishes to Nexus under the
   `latest` tag. It then commits `package.json` at `0.2.0` back to `main`
   (as `chore: set version 0.2.0 [skip ci]`).

No local version command and no changelog file to maintain. The one commit that touches
the version is made by the Action, not you.

Version numbers are [semver](https://semver.org/): major.minor.patch. We stay on `0.x`
while the library is new (a minor version may include breaking changes), and move to
`1.0.0` once it's stable. GRIP and Archive track the `dev` tag on their main branch and
pin an exact release on a release branch - see [the README](../README.md).

## Snapshots (`dev`)

Every push to `main` publishes a snapshot to Nexus under the `dev` tag (see
`.github/workflows/on-push.yml`). This lets apps track the newest build without waiting
for a real release.

- The version is `<latest release>-dev-<git hash>`, for example `0.1.0-dev-1a2b3c4`. The
  base comes from the latest git tag (before the first release it is `0.0.0`).
- Each commit gets its own unique version, so there is never a stale-cache or integrity
  problem.
- The `dev` tag always points at the newest snapshot. It never touches `latest`.
- A `-dev-` version sorts _below_ its release in semver (`0.1.0-dev-1a2b3c4` < `0.1.0`).
  That is why apps depend on the `dev` tag string, not a `^` range - a range would never
  pick up a snapshot.

Apps opt in by depending on the `dev` tag. See "Use the newest build" in the
[README](../README.md).

### Does `dev` stay reproducible?

Yes, within retention. An app pins the exact snapshot it resolved (`0.2.0-dev-1a2b3c4`
plus its integrity hash) in its own `package-lock.json`, not just the `dev` tag. So
`npm ci` on any commit reinstalls the exact library build that commit used, and going back
in history rebuilds against the library it was built with - not the newest `dev`. The tag
only decides what `npm update` pulls forward; the lockfile pins the bytes.

The one limit is retention: `-dev-` snapshots are pruned on Nexus over time (like Maven
`-SNAPSHOT`), so a very old commit whose snapshot was already pruned can no longer
reinstall it. Keep retention long enough to cover how far back you rebuild `main`. Anything
that must stay reproducible long-term lives on a release branch pinned to a real release,
which is never pruned.

(There is no version range that tracks "the newest dev". A caret on a prerelease like
`^1.2.0-dev` only floats within `1.2.0`'s prereleases, never across versions - that is why
apps use the `dev` tag, not a range.)

## Before the first release (infra)

- The npm repository on Nexus (`https://nexus.aerius.nl/repository/npm/`). Snapshots and
  releases share this one repo, because every published version is unique.
- The registry URL is configurable: the workflows read the `NEXUS_REGISTRY` repo/org
  **variable** and fall back to the URL above. Set the variable only if the path differs.
- A dedicated Nexus CI account (not a personal login) with publish rights to that repo,
  and a token for it. Store the token as the `NEXUS_TOKEN` secret on the **upstream** repo
  (`aerius/vue-geo-components`). `actions/setup-node` wires it up as `NODE_AUTH_TOKEN`.
- Publishing runs only on the upstream repo. Forks never publish (and have Actions turned
  off), so no secret is needed on a fork.
- For the version bump-back, the Action pushes one commit to `main`. This needs Actions
  write access (repo Settings -> Actions -> Workflow permissions -> "Read and write"), and
  if `main` is protected, `github-actions` must be allowed to push to it (add it to the
  branch-protection bypass list).
- A Nexus cleanup policy that prunes old `-dev-` snapshot versions (they accumulate on
  every push to `main`). Keep real releases exempt, and keep snapshots long enough to cover
  how far back `main` is rebuilt (see "Does `dev` stay reproducible?" above).
