// Makes a release of the library and the web app, which share one version:
//
//   pnpm release <version | major | minor | patch> [--dry-run]
//
// Write the release notes under "## Unreleased" at the top of CHANGELOG.md first; they may be left uncommitted.
// The script checks that master is clean and up to date, builds and tests, sets the version, dates the changelog
// section, commits, tags v<version>, pushes both and creates the GitHub release. The release starts
// .github/workflows/publish-npm.yml, which publishes the library to npm. --dry-run only shows what would change.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REPO = "mapequation/alluvial";
const BRANCH = "master";
const PACKAGES = [
  "package.json",
  "apps/web/package.json",
  "packages/alluvial-diagram/package.json",
];
const CITATION = "CITATION.cff";
const CHANGELOG = "CHANGELOG.md";

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const dryRun = args.includes("--dry-run");
const [target, ...extra] = args.filter((arg) => arg !== "--dry-run");

function fail(message) {
  console.error(`release: ${message}`);
  process.exit(1);
}

function git(...gitArgs) {
  // Not trim(): the first line of `git status --porcelain` starts with a space
  return execFileSync("git", gitArgs, { encoding: "utf8" }).trimEnd();
}

function run(command, commandArgs, hint = "") {
  console.log(`\n$ ${command} ${commandArgs.join(" ")}`);
  try {
    execFileSync(command, commandArgs, { stdio: "inherit" });
  } catch {
    fail(`${command} ${commandArgs[0]} failed${hint ? `; ${hint}` : ""}`);
  }
}

function nextVersion(current, target) {
  const [major, minor, patch] = current.split(".").map(Number);
  if (target === "major") return `${major + 1}.0.0`;
  if (target === "minor") return `${major}.${minor + 1}.0`;
  if (target === "patch") return `${major}.${minor}.${patch + 1}`;
  if (!/^\d+\.\d+\.\d+$/.test(target))
    fail(
      `expected a version like 2.1.0, or major, minor or patch, not "${target}"`,
    );
  const isNewer = target
    .split(".")
    .map(Number)
    .map((part, i) => part - [major, minor, patch][i])
    .find((diff) => diff !== 0);
  if (!(isNewer > 0))
    fail(`${target} is not newer than the current version ${current}`);
  return target;
}

if (!target || extra.length > 0)
  fail("usage: pnpm release <version | major | minor | patch> [--dry-run]");

process.chdir(git("rev-parse", "--show-toplevel"));

const branch = git("branch", "--show-current");
if (branch !== BRANCH)
  fail(`releases are made from ${BRANCH}, not ${branch || "a detached HEAD"}`);

const dirty = git("status", "--porcelain")
  .split("\n")
  .filter((line) => line && line.slice(3) !== CHANGELOG);
if (dirty.length > 0)
  fail(
    `commit or discard these changes first (only ${CHANGELOG} may differ):\n${dirty.join("\n")}`,
  );

git("fetch", "--quiet", "--tags", "origin", BRANCH);
if (git("rev-parse", "HEAD") !== git("rev-parse", `origin/${BRANCH}`)) {
  fail(`${BRANCH} differs from origin/${BRANCH}; pull or push first`);
}

const files = Object.fromEntries(
  [...PACKAGES, CITATION, CHANGELOG].map((file) => [
    file,
    readFileSync(file, "utf8"),
  ]),
);

const versions = PACKAGES.map((file) => JSON.parse(files[file]).version);
if (new Set(versions).size > 1) {
  fail(
    `the packages should share one version:\n${PACKAGES.map((file, i) => `${file}: ${versions[i]}`).join("\n")}`,
  );
}
const current = versions[0];
const version = nextVersion(current, target);
const tag = `v${version}`;
const previousTag = `v${current}`;

if (git("tag", "--list", tag)) fail(`the tag ${tag} already exists`);
if (!git("tag", "--list", previousTag))
  fail(`the current version has no tag ${previousTag}`);

const unreleased = /^## Unreleased.*$/m.exec(files[CHANGELOG]);
if (!unreleased) {
  fail(`add the release notes under "## Unreleased" at the top of ${CHANGELOG}; the changes since ${previousTag}:
${git("log", "--format=  %s", `${previousTag}..HEAD`)}`);
}
const sectionStart = unreleased.index + unreleased[0].length;
const nextSection = files[CHANGELOG].slice(sectionStart).search(/^##? /m);
const notes = files[CHANGELOG].slice(
  sectionStart,
  nextSection === -1 ? undefined : sectionStart + nextSection,
).trim();
if (!notes) fail(`the "## Unreleased" section of ${CHANGELOG} is empty`);

const date = new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD in local time
const heading = `## [${version}](https://github.com/${REPO}/compare/${previousTag}...${tag}) (${date})`;

const updated = {
  ...Object.fromEntries(
    PACKAGES.map((file) => [
      file,
      files[file].replace(/"version": "[^"]*"/, `"version": "${version}"`),
    ]),
  ),
  [CITATION]: files[CITATION].replace(
    /^version: .*$/m,
    `version: ${version}`,
  ).replace(/^date-released: .*$/m, `date-released: '${date}'`),
  [CHANGELOG]: files[CHANGELOG].replace(unreleased[0], heading),
};

console.log(
  `Release ${current} → ${version} (${tag})\n\n${heading}\n\n${notes}\n`,
);
if (dryRun) {
  console.log(
    `Dry run: would build, test, update ${Object.keys(updated).join(", ")}, commit, tag ${tag}, push and create the GitHub release.`,
  );
  process.exit(0);
}

run("pnpm", ["build"], "nothing was changed");
run("pnpm", ["test"], "nothing was changed");

for (const [file, text] of Object.entries(updated)) writeFileSync(file, text);

const notesFile = join(
  mkdtempSync(join(tmpdir(), "alluvial-release-")),
  "notes.md",
);
writeFileSync(notesFile, `${notes}\n`);

const undo = `undo the local release with: git tag -d ${tag} && git reset --hard origin/${BRANCH} (the notes stay in ${notesFile})`;
run("git", ["add", ...Object.keys(updated)]);
run("git", ["commit", "--quiet", "-m", `chore(release): ${version}`]);
run("git", ["tag", "-a", tag, "-m", tag], undo);
run("git", ["push", "--atomic", "origin", BRANCH, tag], undo);
run(
  "gh",
  [
    "release",
    "create",
    tag,
    "--repo",
    REPO,
    "--verify-tag",
    "--title",
    tag,
    "--notes-file",
    notesFile,
  ],
  `${tag} is pushed; retry with: gh release create ${tag} --repo ${REPO} --verify-tag --title ${tag} --notes-file ${notesFile}`,
);

console.log(`
Released ${tag}. The release starts the npm publish and the push to ${BRANCH} the Pages deploy. Check them with:
  gh run list --repo ${REPO} --workflow publish-npm.yml --limit 1
  gh run list --repo ${REPO} --workflow pages.yml --limit 1
  npm view @mapequation/alluvial-diagram version`);
