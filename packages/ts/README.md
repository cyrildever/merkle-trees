# merkle-ts
_TypeScript implementation of Merkle tree_


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

const proofs1 = await tree1.addLeaves(true, '1', '2', '3'))
const rootHash = tree1.getRootHash()
assert(tree1.depth() === 1)

const json = tree1.toJSON()

const tree2 = await MerkleTree.fromJSON(json)
assert(tree1.size() === tree2.size())
const sha256 = buildHashFunction(SHA_256)
assert(tree2.validateProof(proofs1[0], sha256('1'), rootHash) === true)

const proofs2 = await tree2.addLeaves(false, '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789')
assert(tree2.size() === 5)
assert(tree2.depth() === 2)
assert(proofs1[0].some().toString() === proofs2[0].some().toString())
```


### License

This library is distributed under an MIT license.
See the [LICENSE](LICENSE) file.


<hr />
&copy; 2022 Cyril Dever. All rights reserved.