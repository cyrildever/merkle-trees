import setuptools

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setuptools.setup(
    name="merkle-py",
    version="1.0.0",
    author="Cyril Dever",
    author_mail="cdever@pep-s.com",
    description="Merkle tree for Python",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/cyrildever/merkle-trees/packages/py",
    project_urls={
        "Bug Tracker": "https://github.com/cyrildever/merkle-trees/issues",
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    keywords=[
        "python",
        "merkle-tree",
    ],
    package_dir={"": "src"},
    packages=setuptools.find_packages(where="src"),
    python_requires=">=3.6",
)
