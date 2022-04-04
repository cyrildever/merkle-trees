# merkle-py
_Python implementation of Merkle tree_

This library defines my special implementation in Python of the notorious Merkle trees. Feel free to use it (with the appropriate credits).

Other implementations include: [Go](../go/README.md), [Scala](../scala/README.md) and [TypeScript](../ts/README.md).


### Usage

```console
$ pip install merkle-py
```

Here are some simple examples of how it works:
```python
from merklepy.tree import MerkleTree, MerkleTreeOptions
from merklepy.hash import build_hash_function, SHA_256

options1 = MerkleTreeOptions(doubleHash= True, engine='sha-256', sort=True)
tree1 = MerkleTree(options1)

# Build a tree from the raw data
proofs1 = tree1.add_leaves(True, '1', '2', '3')
root_hash = tree1.get_root_hash()
assert(tree1.depth() == 1)

json = tree1.to_json()

# Build another identical tree from the JSON of the first one
tree2 = tree_from(json)
assert(tree1.size() == tree2.size())
sha256 = build_hash_function(SHA_256)
assert(tree2.size() == proofs1[0].size)
assert(tree2.validate_proof(proofs1[0], sha256('1'), root_hash) == True)

# Enrich with new hashed data
proofs2 = tree2.add_leaves(False,
    bytes.fromhex('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
    bytes.fromhex('abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789')
)
assert(tree2.size() == 5)
assert(tree2.depth() == 2)

# Because the size of the tree has changed, and so has the root hash
assert(proofs1[0].to_string() != proofs2[0].to_string() and tree2.validate_proof(proofs1[0], sha256('1'), root_hash) == False)
```

#### Important note

As you can see from the examples above, for a continuously growing Merkle tree, proofs may not work at all time. You may need either a new proof from the latest tree, or rebuild the old tree, hence the `size` attribute passed within the `MerkleProof` instance. If you don't use a sorted tree and keep a record of the leaves' hashes in the order they were included in the tree, this allows you to rebuild the corresponding tree and therefore use any proof at any time. \
In other words, this implementation is either not made for a growing tree, or should take this behaviour into account when issuing and verifying proofs.



### Tests

```console
$ python3 -m unittest discover
```


### License

This library is distributed under an MIT license.
See the [LICENSE](LICENSE) file.


<hr />
&copy; 2022 Cyril Dever. All rights reserved.