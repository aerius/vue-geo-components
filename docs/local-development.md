# Local development against GRIP / Archive

Change library code and see it in GRIP or Archive right away, without publishing a new
version each time. We use yalc: it copies the built library into the app, like a normal
installed package.

## Setup (once)

```bash
npm i -g yalc
```

## Daily use

In the library, open two terminals:

```bash
# terminal 1: rebuild the library every time you save
npm run dev

# terminal 2: send each new build into the linked apps
npx nodemon --watch dist --exec "yalc push"
```

In GRIP or Archive, link the library once:

```bash
yalc add @aerius/vue-geo-components
npm install
```

Now save a file in the library, it rebuilds, and the app updates on screen.

When you're done, remove the local copy:

```bash
yalc remove @aerius/vue-geo-components && npm install
```

**Warning:** `yalc add` changes the app's `package.json` (it adds a `file:.yalc/...`
line). Never commit that to GRIP or Archive. It would break the build for everyone else.

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

yalc only works on your machine. To give your changes to teammates or CI, publish a real
version to Nexus. See [versioning.md](./versioning.md).
