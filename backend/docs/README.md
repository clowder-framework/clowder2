Clowder 2 Backend Documentation
===

Uses [Sphinx](https://www.sphinx-doc.org). Requires [enchant](https://pyenchant.github.io/pyenchant/install.html) for spell checking

```shell
# build
make build

# view
python -m http.server --directory build/html

# check links
make linkcheck

# spell checking 

# install enchant once, on mac
brew install enchant

make spelling
```

Great [talk](https://www.youtube.com/watch?v=0ROZRNZkPS8) on Sphinx.
Sphinx [themes](https://sphinx-themes.org/).