Clowder 2 Backend Documentation
===

Uses [Sphinx](https://www.sphinx-doc.org). Requires [enchant](https://pyenchant.github.io/pyenchant/install.html) for spell checking.

Currently deployed at https://clowder2.readthedocs.io.

If you have installed `sphinx-autobuild docs/source docs/build/html` you can use it to automatically rebuild the docs
when you make changes.

```shell
sphinx-autobuild source build/html

open http://localhost:8000/
```

If you don't have `sphinx-autobuild` installed, you can use the Makefile.

```shell
# build
make html

# view
python3 -m http.server 7000 --directory build/html
open http://localhost:7000/

# check links
make linkcheck
```

You can check spelling with `make spelling`. This requires `enchant` to be installed.

```shell
# install enchant once, on mac
brew install enchant

make spelling
```

Great [talk](https://www.youtube.com/watch?v=0ROZRNZkPS8) on Sphinx.
Sphinx [themes](https://sphinx-themes.org/).
