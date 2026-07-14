# Versioning and releases

There are two channels:

- **`latest`** - real releases with clean version numbers (`0.2.0`). For shipping.
- **`dev`** - a snapshot published on every push to `main`. For always tracking the
  newest build.

## Real releases (`latest`)

- We use [Changesets](https://github.com/changesets/changesets) to set the version number
  and write the changelog. Don't edit the version by hand.
- Version numbers are [semver](https://semver.org/): major.minor.patch. GRIP and Archive
  depend on a `^0.x` range.
- We stay on `0.x` while the library is new. During `0.x`, a minor version can include
  breaking changes. We move to `1.0.0` once it's stable.

### For each change

```bash
npm run changeset
```

Pick major, minor, or patch, and write one line for the changelog. Commit the new file in
`.changeset/` with your PR. No user-facing change means no changeset.

### To release

1. On `main`, apply the pending changes:
   ```bash
   npm run version   # updates the version and CHANGELOG.md
   ```
2. Commit and push.
3. Make a GitHub Release with a tag that matches the new version (like `v0.2.0`).
4. This triggers the release workflow, which builds, tests, and publishes to Nexus under
   the `latest` tag.

## Snapshots (`dev`)

Every push to `main` publishes a snapshot to Nexus under the `dev` tag (see
`.github/workflows/on-push.yml`). This lets apps track the newest build without waiting
for a real release.

- The version is `<base>-dev-<git hash>`, for example `0.1.0-dev-1a2b3c4`. Each commit
  gets its own unique version, so there is never a stale-cache or integrity problem.
- The `dev` tag always points at the newest snapshot.
- Snapshots are separate from real releases and never affect the `latest` tag.

Apps opt in by depending on the `dev` tag. See "Use the newest build" in the
[README](../README.md).

## Before the first release (infra)

- One `npm (hosted)` repository on `nexus.aerius.nl`. Confirm the exact path; the config
  assumes `repository/npm-hosted/`. Snapshots and releases share this one repo, because
  every published version is unique.
- The `NEXUS_USERNAME` and `NEXUS_PASSWORD` secrets, with rights to publish there. These
  are the same ones the Maven repos (aerius/search, aerius/IMAER-java) already use.
