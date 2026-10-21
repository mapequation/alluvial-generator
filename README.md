# Alluvial Diagram Generator

Alluvial diagrams show how the modules of networks change across time, across layers, or between different
partitions of the same network. Each network is a vertical stack of modules. Streamlines connect modules that share
nodes, and their heights are proportional to the flow of those nodes. Modules from hierarchical
[Infomap](https://www.mapequation.org/infomap/) partitions can be expanded into their sub-modules.

You can make them in two ways:

- **In the browser:** the web app at [mapequation.org/alluvial](https://www.mapequation.org/alluvial), for
  interactive exploration.
- **In Python:** the [`alluvial`](https://pypi.org/project/alluvial/) package, for matplotlib figures in papers
  ([documentation](https://mapequation.org/alluvial-py/), [repository](https://github.com/mapequation/alluvial-py)).

Both use the same layout, so their diagrams match, and both write and read the same saved diagram files.

## Web app

[mapequation.org/alluvial](https://www.mapequation.org/alluvial)

- Load Infomap output (`tree`, `ftree`, `clu` or `json`), or Pajek `net` networks, which you cluster with Infomap
  in the browser.
- Match nodes across networks by id or by name, and expand or contract sub-modules.
- Colour modules one by one, or all at once: by matching modules across networks, by module id, by module
  hierarchy, by the nodes of a selected network, or by layer.
- Export the diagram as SVG. Save it with **Download diagram (.zip)** and open it again later, in the app or in
  Python.

The Help dialog in the app explains the controls.

## Python

```sh
pip install alluvial
```

```python
import alluvial

ax = alluvial.plot(["2020.tree", "2021.tree"], names=["2020", "2021"])
ax.figure.savefig("alluvial.png", dpi=150)
```

A network can be an Infomap output file, Infomap JSON, or an `infomap.Infomap` object that has run (with
`pip install "alluvial[infomap]"`). See the [documentation](https://mapequation.org/alluvial-py/).

## JavaScript library

The engine behind the web app is published on npm as
[`@mapequation/alluvial-diagram`](https://www.npmjs.com/package/@mapequation/alluvial-diagram). It provides a MobX
store and a React SVG view for adding alluvial diagrams to other apps. See
[`packages/alluvial-diagram/README.md`](packages/alluvial-diagram/README.md).

## Development

This repository is a pnpm workspace:

- `apps/web`: the web app
- `packages/alluvial-diagram`: the diagram engine

```sh
pnpm install
pnpm dev        # web app dev server
pnpm build      # the library, then the app
pnpm test       # library and app tests; run `pnpm build:lib` first, since the app tests import the library build
```

The Python package ports `packages/alluvial-diagram` and reproduces its output bit for bit. A change to what the
engine computes, reads or writes needs a matching change in [alluvial-py](https://github.com/mapequation/alluvial-py).
Its CI checks this engine's `master` every week.

## Authors and license

Anton Holmgren and Daniel Edler. To cite the software, use [`CITATION.cff`](CITATION.cff) ("Cite this repository"
on GitHub). MIT license, see [`LICENSE`](LICENSE).
