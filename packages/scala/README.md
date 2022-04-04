# merkle-tree
_Scala implementation of Merkle tree_

This library defines my special implementation for the JVM in Scala of the notorious Merkle trees. Feel free to use it (with the appropriate credits).

Other implementations include: [Go](../go/README.md), [Python](../py/README.md) and [TypeScript](../ts/README.md).

### Usage

```scala
import com.cyrildever.merkle.hash.Hash._
import com.cyrildever.merkle.hash.HashFunction._
import com.cyrildever.merkle.tree._
import com.cyrildever.merkle.tree.MerkleTree

val options1 = MerkleTreeOptions(doubleHash = true, engine = "sha-256", sort = true)
val tree1 = MerkleTree(options1)

// Build a tree from the raw data
val maybeProofs1 = tree1.addLeaves(true, "1".getBytes, "2".getBytes, "3".getBytes)
val rootHash = tree1.getRootHash
val depth1 = tree1.depth()
assert(depth1 == 1)

val json = tree1.toJSON

// Build another identical tree from the JSON of the first one
val tree2 = MerkleTree.fromJSON(json)
assert(tree1.size() == tree2.size())
assert(tree2.size() == maybeProofs1.head.size)

val sha256 = buildHashFunction(SHA_256)
assert(tree2.validateProof(maybeProofs1.head.get, sha256("1".getBytes), rootHash))

// Enrich with new hashed data
val maybeProofs2 = tree2.addLeaves(false, fromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"), fromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"))
assert(tree2.size() == 5)
val depth2 = tree2.depth()
assert(depth2 == 2)

// Because the size of the tree has changed, and so has the root hash
assert(maybeProofs1.head.toString != maybeProofs2.head.toString && !tree2.validateProof(maybeProofs1.head, sha256("1".getBytes), rootHash))
```

#### Important note

As you can see from the examples above, for a continuously growing Merkle tree, proofs may not work at all time. 
You may need either a new proof from the latest tree, or rebuild the old tree, hence the `size` attribute passed within the `MerkleProof` instance. 
If you don't use a sorted tree and keep a record of the leaves' hashes in the order they were included in the tree, this allows you to rebuild the corresponding tree and therefore use any proof at any time. \
In other words, this implementation is either not made for a growing tree, or should take this behaviour into account when issuing and verifying proofs.


### Build

```console
$ sbt
> assembly
```


### License

This library is distributed under an MIT license.
See the [LICENSE](../../LICENSE) file.


<hr />
&copy; 2022 Cyril Dever. All rights reserved.