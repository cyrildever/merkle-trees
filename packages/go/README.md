# merkle-tree
_Golang implementation of Merkle tree_

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/cyrildever/merkle-trees)
![GitHub last commit](https://img.shields.io/github/last-commit/cyrildever/merkle-trees)
![GitHub issues](https://img.shields.io/github/issues/cyrildever/merkle-trees)
![GitHub](https://img.shields.io/github/license/cyrildever/merkle-trees)

This library defines my special implementation in Go of the notorious Merkle trees. Feel free to use it (with the appropriate credits).

Other implementations include: [Python](../py/README.md), [Scala](../scala/README.md) and [TypeScript](../ts/README.md).


### Usage

```console
$ go get github.com/cyrildever/merkle-trees/packages/go
```

Here are some simple examples of how it works:
```golang
import (
    "github.com/cyrildever/merkle-trees/packages/go/model/hash"
    "github.com/cyrildever/merkle-trees/packages/go/model/merkle"

    utls "github.com/cyrildever/go-utls/common/utils"
)

options1 := merkle.NewTreeOptions(true, "sha-256", true)
tree1 := merkle.NewTree(options1)

// Build a tree from the raw data
proofs1, err := tree1.AddLeaves(true, '1', '2', '3'))
rootHash, err := tree1.GetRootHash()
depth1, err := tree.Depth()
assert.Equal(t, depth1, 1)

json, err := tree1.JSON()

// Build another identical tree from the JSON of the first one
tree2, err := merkle.TreeFrom(json)
assert.Equal(t, tree1.Size(), tree2.Size())
sha256, err := hash.BuildFunction(hash.SHA_256)
assert.Equal(t, tree2.Size(), proofs1[0].Size)
assert.Assert(t, tree2.ValidateProof(proofs1[0], sha256('1'), rootHash))

// Enrich with new hashed data
proofs2, err := tree2.AddLeaves(false, utls.Must(utls.FromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")), utls.Must(utls.FromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")))
assert.Equal(t, tree2.Size(), 5)
depth2, err := tree2.Depth()
assert.Equal(t, depth2, 2)

// Because the size of the tree has changed, and so has the root hash
assert.Assert(t, proofs1[0].String() != proofs2[0].String() && !tree2.ValidateProof(proofs1[0], sha256('1'), rootHash))
```

#### Important note

As you can see from the examples above, for a continuously growing Merkle tree, proofs may not work at all time. You may need either a new proof from the latest tree, or rebuild the old tree, hence the `size` attribute passed within the `MerkleProof` instance. If you don't use a sorted tree and keep a record of the leaves' hashes in the order they were included in the tree, this allows you to rebuild the corresponding tree and therefore use any proof at any time. \
In other words, this implementation is either not made for a growing tree, or should take this behaviour into account when issuing and verifying proofs.


### Build

```console
$ git clone https://github.com/cyrildever/merkle-trees.git .
$ cd merkle-trees/packages/go/
$ go build -o merkle-tree
```


### License

This library is distributed under an MIT license.
See the [LICENSE](../../LICENSE) file.


<hr />
&copy; 2022 Cyril Dever. All rights reserved.