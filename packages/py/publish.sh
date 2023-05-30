#!/bin/bash

# Remove former distributions
rm dist/merkle_py-*

# Publishes library to PyPI

python3 -m build
python3 -m twine upload dist/*
