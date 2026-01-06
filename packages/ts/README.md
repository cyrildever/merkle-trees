# merkle-ts
_TypeScript implementation of Merkle tree_

![Github tag (latest by date)](https://img.shields.io/github/v/tag/cyrildever/merkle-trees)
![npm](https://img.shields.io/npm/dw/merkle-ts)
![Github last commit](https://img.shields.io/github/last-commit/cyrildever/merkle-trees)
![Github issues](https://img.shields.io/github/issues/cyrildever/merkle-trees)
![NPM](https://img.shields.io/npm/l/merkle-ts)

This library defines my special implementation in TypeScript of the notorious Merkle trees. Feel free to use it (with the appropriate credits).

Other implementations include: [Go](../go/README.md), [Python](../py/README.md) and [Scala](../scala/README.md).

### Usage

```console
$ npm i merkle-ts
```

Here are some simple examples of how it works:
```typescript
import { buildHashFunction, MerkleTree, MerkleTreeOptions, SHA_256 } from 'merkle-ts'

const options1 = {
  doubleHash: true,
  engine: 'sha-256',
  sort: true
} as MerkleTreeOptions
const tree1 = new MerkleTree(options1)

// Build a tree from the raw data
const proofs1 = await tree1.addLeaves(true, '1', '2', '3')
const rootHash = tree1.getRootHash()
assert(tree1.depth() === 1)

const json = tree1.toJSON()

// Build another identical tree from the JSON of the first one
const tree2 = await MerkleTree.fromJSON(json)
assert(tree1.size() === tree2.size())
const sha256 = buildHashFunction(SHA_256)
assert(tree2.size() === proofs1[0].size)
assert(tree2.validateProof(proofs1[0], sha256('1'), rootHash) === true)

// Enrich with new hashed data
const proofs2 = await tree2.addLeaves(false, Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'hex'), Buffer.from('abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789', 'hex'))
assert(tree2.size() === 5)
assert(tree2.depth() === 2)

// Because the size of the tree has changed, and so has the root hash
assert(proofs1[0].some().toString() !== proofs2[0].some().toString() && !tree2.validateProof(proofs1[0], sha256('1'), rootHash))
```

#### Important note

As you can see from the examples above, for a continuously growing Merkle tree, proofs may not work at all time. You may need either a new proof from the latest tree, or rebuild the old tree, hence the `size` attribute passed within the `MerkleProof` instance. If you don't use a sorted tree and keep a record of the leaves' hashes in the order they were included in the tree, this allows you to rebuild the corresponding tree and therefore use any proof at any time. \
In other words, this implementation is either not made for a growing tree, or should take this behaviour into account when issuing and verifying proofs.


### License

This library is distributed under a MIT license. \
See the [LICENSE](LICENSE) file.


<hr />
&copy; 2022-2026 Cyril Dever. All rights reserved.