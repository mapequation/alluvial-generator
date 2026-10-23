# alluvial

pnpm workspace with the diagram engine `packages/alluvial-diagram` (published as `@mapequation/alluvial-diagram`) and
the web app `apps/web`. The app tests import the library's `dist`, so run `pnpm build:lib` before `pnpm test`.

## Python port (alluvial-py)

`alluvial-py` ports the engine in `packages/alluvial-diagram` to Python, line for line: layout, parsers, colour
schemes and colour operations, and the saved-diagram format (`formatVersion` 1). It reproduces this engine bit for
bit, against reference fixtures that its tooling makes by running the TypeScript sources of a checkout of this repo.
Repo: https://github.com/mapequation/alluvial-py, docs: https://mapequation.org/alluvial-py/, PyPI package:
[`alluvial`](https://pypi.org/project/alluvial/). The local checkout is `../../alluvial-py` from the main checkout
(`code/alluvial-py` next to `code/web/alluvial`). If it is missing, clone the repo there.

alluvial-py's CI also checks parity, after the fact. `tests.yml` checks against the TS commit in its
`tests/fixtures/provenance.txt`. `ts-drift.yml` runs weekly against this repo's `master` and fails when the TS output
changes. A behaviour change merged here without the port being updated shows up there within a week.

### Changes that affect the port

A change under `packages/alluvial-diagram/src` that changes what the engine computes, reads or writes:

- layout: `alluvial/`, the `DiagramStore` options and layout
- parsing and validation: `parsers/`
- colours: `schemes/` and the `DiagramStore` colour operations
- the saved-diagram format: `parsers/alluvial-format.ts`, including new fields

Changes that don't: UI in `apps/web`, styles, tests and docs.

### What to do here

1. Before opening a PR with such a change, run the parity check against your checkout. It reads this repo and writes
   nothing here. It needs `node_modules` installed (`pnpm install`).

   ```sh
   TS=$(git rev-parse --show-toplevel)
   PY=$(git rev-parse --path-format=absolute --git-common-dir)/../../../alluvial-py
   (cd "$PY" && ALLUVIAL_TS_ROOT="$TS" node tools/ts-fixtures/generate.mjs --check)
   ```

   Exit 0 means the Python output is unchanged. Otherwise it lists the fixtures that differ and keeps the regenerated
   copies in a temporary directory.
2. If an intended change makes fixtures differ, add a "Python parity" section to the PR: which fixtures differ and
   what differs (for example colour values only, geometry, or saved files).
3. Don't edit `alluvial-py` from a session in this repo. The port is updated from a session in `alluvial-py`. It
   finds the changes to port with `git log <ts_repo_head>..master -- packages/alluvial-diagram/src`, where
   `ts_repo_head` comes from its `tests/fixtures/provenance.txt`, and then regenerates its fixtures.
4. Bugs found while porting come back here as a branch in its own worktree, as `py-parity-fixes` did (#55).

### Colours

The C3 schemes, their tone and offset, and colouring by module hierarchy come from `@mapequation/c3`. Its Python port
is `c3-colors` on PyPI. Keep both at the same version (2.0.1 now). A c3 upgrade changes the colour fixtures.

## Releasing

The library and the web app share one version, set in the three `package.json` files and `CITATION.cff`. Releases are
made by hand from `master`, when asked:

1. Pick the version from the changes since the last tag (`git log --oneline v<current>..master`): major for changes
   that break code or saved diagrams people use, minor for features, patch for fixes.
2. Write the release notes under `## Unreleased` at the top of `CHANGELOG.md`, for users of the library and the app.
   They can stay uncommitted.
3. Run `pnpm release <version>` (or `major`, `minor`, `patch`). `--dry-run` shows the version and the notes first. It
   checks that `master` is clean and up to date, builds and tests, sets the version, dates the changelog section,
   commits `chore(release): <version>`, tags `v<version>`, pushes both and creates the GitHub release.
4. The release starts `publish-npm.yml`, which publishes the library to npm with trusted publishing, and the push
   starts `pages.yml`. Check that both runs pass, that `npm view @mapequation/alluvial-diagram version` shows the new
   version, and that the app at https://mapequation.org/alluvial/ shows it next to the logo.
