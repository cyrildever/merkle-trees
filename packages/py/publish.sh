#!/bin/bash

# Remove former distributions
rm dist/merkle_py-*
rm dist/merkle-py-*

# Publishes library to PyPI

python3 -m build
python3 -m twine upload dist/*
