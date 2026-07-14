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
`1.0.0` once it's stable. GRIP and Archive depend on a `^0.x` range or pin an exact
version - see [the README](../README.md).

## Snapshots (`dev`)

Every push to `main` publishes a snapshot to Nexus under the `dev` tag (see
`.github/workflows/on-push.yml`). This lets apps track the newest build without waiting
for a real release.

- The version is `<latest release>-dev-<git hash>`, for example `0.1.0-dev-1a2b3c4`. The
  base comes from the latest git tag (before the first release it is `0.0.0`).
- Each commit gets its own unique version, so there is never a stale-cache or integrity
  problem.
- The `dev` tag always points at the newest snapshot. It never touches `latest`.

Apps opt in by depending on the `dev` tag. See "Use the newest build" in the
[README](../README.md).

## Before the first release (infra)

- One `npm (hosted)` repository on `nexus.aerius.nl`. Confirm the exact path; the config
  assumes `repository/npm-hosted/`. Snapshots and releases share this one repo, because
  every published version is unique.
- A dedicated Nexus CI account (not a personal login) with publish rights to that repo,
  and a token for it. Store the token as the `NEXUS_TOKEN` secret on the **upstream** repo
  (`aerius/vue-geo-components`). The `.npmrc` reads it as `_authToken`.
- Publishing runs only on the upstream repo. Forks run CI but never publish, so no secret
  is needed on a fork.
- For the version bump-back, the Action pushes one commit to `main`. This needs Actions
  write access (repo Settings -> Actions -> Workflow permissions -> "Read and write"), and
  if `main` is protected, `github-actions` must be allowed to push to it (add it to the
  branch-protection bypass list).
