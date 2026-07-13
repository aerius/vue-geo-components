# Versioning and releases

## How it works

- We use [Changesets](https://github.com/changesets/changesets) to set the version number
  and write the changelog. Don't edit the version by hand.
- Version numbers are [semver](https://semver.org/): major.minor.patch. GRIP and Archive
  depend on a `^0.x` range.
- Publishing to Nexus happens when you make a GitHub Release.

We stay on `0.x` while the library is new. During `0.x`, a minor version can include
breaking changes. We move to `1.0.0` once it's stable.

## For each change

```bash
npm run changeset
```

Pick major, minor, or patch, and write one line for the changelog. Commit the new file in
`.changeset/` with your PR. No user-facing change means no changeset.

## To release

1. On `main`, apply the pending changes:
   ```bash
   npm run version   # updates the version and CHANGELOG.md
   ```
2. Commit and push.
3. Make a GitHub Release with a tag that matches the new version (like `v0.2.0`).
4. This triggers the release workflow, which builds, tests, and publishes to Nexus.

## Before the first release (infra)

- An npm repository on `nexus.aerius.nl`. Confirm the exact path; the config assumes
  `repository/npm-hosted/`.
- The `NEXUS_USERNAME` and `NEXUS_PASSWORD` secrets, with rights to publish there. These
  are the same ones the Maven repos (aerius/search, aerius/IMAER-java) already use.
