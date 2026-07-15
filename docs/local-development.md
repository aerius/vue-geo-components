# Local development against a consuming app

Change library code and see it in the consuming app right away, without publishing a new
version each time. We use yalc: it copies the built library into the app, like a normal
installed package.

## Setup (once)

yalc is stable and heavily used but no longer actively maintained, so we pin the last
published version:

```bash
npm i -g yalc@1.0.0-pre.53
```

## Daily use

In the library, two terminals:

```bash
# terminal 1: rebuild the library every time you save
npm run dev

# terminal 2: send each new build into the linked apps
npx nodemon --watch dist --exec "yalc push"
```

In the consuming app, link the library once:

```bash
yalc add @aerius/vue-geo-components
npm install
```

Now save a file in the library and the app updates on screen.

## Keep it linked (no teardown needed)

You can leave the app linked to your local library permanently. There is no daily
setup/teardown - the two watchers above keep it fresh while you work. You only unlink when
you want the app back on the published version:

```bash
yalc remove @aerius/vue-geo-components && npm install
```

The one thing to get right: keep yalc's changes out of the app's git. `yalc add` writes a
`file:.yalc/...` line into the app's `package.json`, plus a `.yalc/` folder and a
`yalc.lock`. In the app:

- add `.yalc/` and `yalc.lock` to the app's `.gitignore`
- never commit the `file:.yalc/...` line in `package.json` (it would break the build for
  everyone else)

Tip: `yalc link` instead of `yalc add` does the same thing without touching
`package.json` - so there is nothing to accidentally commit - at the cost of using a
symlink instead of a copy.

## Windows

It all works on Windows. Set these up:

- **Node 24.** `nvm-windows` ignores `.nvmrc`. Run `nvm install 24 && nvm use 24`
  yourself, or use `fnm` or `Volta`, which pick the version for you.
- **Line endings.** The repo has a `.gitattributes` file that forces LF, which keeps
  Prettier and the lint check happy. If you cloned before it existed, run
  `git add --renormalize .` once.
- **Two terminals.** Use two tabs, one for each command above.
- **If saving doesn't rebuild** (antivirus, OneDrive, or a network drive can cause this),
  turn on polling in that terminal:
  - PowerShell: `$env:CHOKIDAR_USEPOLLING=1; npm run dev`
  - cmd: `set CHOKIDAR_USEPOLLING=1 && npm run dev`

## Sharing changes with others

yalc only works on your machine. To give your changes to teammates or CI, push to `main`:
that publishes a new `dev` snapshot to Nexus automatically. See
[versioning.md](./versioning.md).
