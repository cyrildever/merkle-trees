#!/bin/bash

# Publishes library to PyPI

python3 -m build
python3 -m twine upload dist/*
