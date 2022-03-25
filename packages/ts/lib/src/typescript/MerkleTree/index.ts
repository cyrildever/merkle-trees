import { Maybe, None, Some } from 'monet'
import { reverse } from 'ts-utls'

import {
  buildHashFunction, buildPath, Hash, Hashes, HashFunction, ImpossibleToSortError, InvalidJSONError, isCorrectHash,
  MerkleProof, MerkleTreeOptions, RIGHT, sortHashes, TreeNotBuiltError
} from '..'

export class MerkleTree {
  private isReady = false
  private readonly hashFunction: HashFunction
  private leaves: Hashes
  private leavesHex: Array<string>
  private levels: Array<Hashes>
  private readonly options: MerkleTreeOptions

  constructor(options?: MerkleTreeOptions) {
    this.leaves = new Array<Hash>()
    this.levels = new Array<Hashes>()
    this.leavesHex = []
    this.options = options !== undefined ? options : MerkleTreeOptions()
    this.hashFunction = buildHashFunction(this.options.engine, this.options.doubleHash)
  }

  /**
   * Add leaves, either sources to hash (by passing `true` to the first parameter) or hashes
   * 
   * @param {boolean} doHash - Set to `true` to hash the passed source data (default: `false`)
   * @param {Buffer[]} data - The data to use as leaf
   * @returns a promise of the corresponding array of `MerkleProof` for the data
   * @throws {ImpossibleToSortError | TreeNotBuiltError}
   */
  public async addLeaves(doHash = false, ...data: Array<Buffer>): Promise<ReadonlyArray<Maybe<MerkleProof>>> {
    if (data.length === 0) {
      return new Array<Maybe<MerkleProof>>()
    }
    this.isReady = false
    this.leaves = this.leaves.concat(doHash ? await Promise.all(data.map(this.hashFunction)) : data.filter(_ => isCorrectHash(_, this.getEngine())))
    this.leavesHex = this.leaves.map(_ => _.toString('hex'))
    if (this.options.sort) {
      if (!this.sort()) {
        throw new ImpossibleToSortError()
      }
    }
    return this.make()
  }

  /**
   * @returns the depth of the tree, ie. the number of levels excluding the root hash
   * @throws {TreeNotBuiltError}
   */
  public depth(): number {
    if (!this.isReady) {
      throw new TreeNotBuiltError()
    }
    return this.levels.length - 1
  }

  /**
   * @returns the name of the used hashing function
   */
  public getEngine(): string {
    return this.options.engine
  }

  /**
   * Try and retrieve the proof in the current Merkle tree for the passed hash
   * 
   * @param {Hash} leaf - The hashed data
   * @returns some corresponding proof, or `None`
   */
  public getProof(leaf: Hash): Maybe<MerkleProof> {
    if (!this.isReady) {
      return None<MerkleProof>()
    }
    const index = this.leavesHex.indexOf(leaf.toString('hex'))
    if (index === -1) {
      return None<MerkleProof>()
    }
    try {
      const path = buildPath(index, this.size(), this.depth())
      const trail = [...path].map((idx, level) => this.levels[level + 1][parseInt(idx)])
      if (trail.length === 0) {
        return None<MerkleProof>()
      }
      return Some(MerkleProof(trail, path, this.getEngine()))
    } catch (e) {
      console.error(e)
      return None<MerkleProof>()
    }
  }

  /**
   * @returns the hexadecimal representation of the root hash of the current Merkle tree
   * @throws {TreeNotBuiltError}
   */
  public getRootHash(): string {
    if (!this.isReady) {
      throw new TreeNotBuiltError()
    }
    return this.levels[0][0].toString('hex')
  }

  /**
   * @returns `true` if the current Merkle tree leaves are sorted
   */
  public isSorted(): boolean {
    return this.options.sort
  }

  /**
   * @returns the number of leaves
   */
  public size(): number {
    return this.leaves.length
  }

  /**
   * IMPORTANT: Use with caution!
   * 
   * @returns the JSON-stringified representation of the current Merkle tree
   * @throws {TreeNotBuiltError}
   */
  public toJSON(): string {
    if (!this.isReady && this.leaves.length !== 0) {
      throw new TreeNotBuiltError()
    }
    return `{"options":${JSON.stringify(this.options)},"leaves":${JSON.stringify(this.leavesHex)}}`
  }

  /**
   * @returns `true` if the current Merkle tree uses double hashing, `false` otherwise
   */
  public useDoubleHash(): boolean {
    return this.options.doubleHash
  }

  /**
   * Check that the passed proof matches the passed data using the passed root hash
   * 
   * @param {MerkleProof} proof - The proof to use
   * @param {Hash} leaf - The (hashed) data to check
   * @param {string} rootHash - The hexadecimal representation of the root hash to compare to
   * @param {boolean} rebuildingProof - Set to `true` to use the method rebuilding the proof (default: `false`)
   * @returns `true` if the proof is valid for the passed leaf
   */
  public async validateProof(proof: MerkleProof, leaf: Hash, rootHash: string, rebuildingProof = false): Promise<boolean> {
    if (!this.isReady || rootHash !== this.getRootHash()) {
      return false
    }
    if (rebuildingProof) {
      const rebuilt = this.getProof(leaf)
      if (rebuilt.isNone()) {
        return false
      }
      return rebuilt.some().toString() === proof.toString()
    } else {
      const path = reverse(proof.path)
      const trail = proof.trail.concat().reverse()
      const hFn = this.hashFunction
      const proved = await trail.reduce(async (h, current, idx) => path[idx] === RIGHT ? hFn(Buffer.concat([current, await h])) : hFn(Buffer.concat([await h, current])), Promise.resolve(leaf))
      return proved.toString('hex') === rootHash
    }
  }

  /**
   * Build a `MerkleTree` instance from the passed string
   * 
   * @param {string} str - The JSON-stringified representation of a full Merkle tree
   * @returns the built `MerkleTree` instance
   * @throws {InvalidJSONError}
   */
  public static async fromJSON(str: string): Promise<MerkleTree> {
    try {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
      const json = JSON.parse(str)
      const options = json.options !== undefined ? json.options as MerkleTreeOptions : MerkleTreeOptions()
      const tree = new MerkleTree(options)
      if (json.leaves === undefined || Object.keys(json.leaves).length === 0 && Object.getPrototypeOf(json.leaves) === Object.prototype) {
        return tree
      }
      const leavesHex: Array<string> = json.leaves
      /* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
      await tree.addLeaves(false, ...leavesHex.map(_ => Buffer.from(_, 'hex')))
      return tree
    } catch (e) {
      if (e instanceof Error) {
        throw new InvalidJSONError(e.message)
      } else {
        throw new InvalidJSONError('invalid json: ' + str)
      }
    }
  }

  // For internal use only

  private async make(): Promise<ReadonlyArray<Maybe<MerkleProof>>> {
    if (this.leaves.length === 0) {
      return Promise.reject(new Error('empty tree'))
    }

    // Build the actual tree
    this.levels.unshift(this.leaves)
    // eslint-disable-next-line no-loops/no-loops
    while (this.levels[0].length > 1) {
      this.levels.unshift(await this.nextLevel())
    }
    if (this.levels.length === 0) {
      return Promise.reject(new Error('empty tree'))
    }
    this.isReady = true

    // Retrieve the proofs
    return this.leaves.map(_ => this.getProof(_))
  }

  private async nextLevel(): Promise<Hashes> {
    const nodes = new Array<Hash>()
    const fromLevel = this.levels[0]
    const fromLevelCount = fromLevel.length
    // eslint-disable-next-line no-loops/no-loops
    for (let i = 0; i < fromLevelCount; i += 2) {
      if (i + 1 <= fromLevelCount - 1) {
        nodes.push(await this.hashFunction(Buffer.concat([fromLevel[i], fromLevel[i + 1]])))
      } else {
        // Odd number promoted to the next level
        nodes.push(fromLevel[i])
      }
    }
    return nodes
  }

  private sort(): boolean {
    try {
      this.leaves = sortHashes(this.leaves)
      return true
    } catch (_) {
      return false
    }
  }
}
