import { Maybe, None, Some } from 'monet'

import {
  buildHashFunction, buildPath, Hash, Hashes, HashFunction, ImpossibleToSortError, InvalidJSONError, isCorrectHash,
  MerkleProof, MerkleTreeOptions, sortHashes, TreeNotBuiltError
} from '..'

export class MerkleTree {
  private isReady = false
  private readonly hashFunction: HashFunction
  private leaves: Hashes
  private levels: Array<Hashes>
  private readonly options: MerkleTreeOptions

  constructor(options?: MerkleTreeOptions) {
    this.leaves = new Array<Hash>()
    this.levels = new Array<Hashes>()
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
  public async addLeaves(doHash = false, ...data: Array<Buffer>): Promise<ReadonlyArray<MerkleProof>> {
    if (data.length === 0) {
      return new Array<MerkleProof>()
    }
    this.isReady = false
    this.leaves = this.leaves.concat(doHash ? await Promise.all(data.map(this.hashFunction)) : data.filter(_ => isCorrectHash(_, this.getEngine())))
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
    const index = this.leaves.indexOf(leaf)
    if (index === -1) {
      return None<MerkleProof>()
    }
    try {
      const path = buildPath(index, this.size(), this.depth())
      const trail = [...path].map((idx, level) => this.levels[level][parseInt(idx)])
      if (trail.length === 0) {
        return None<MerkleProof>()
      }
      const proof = MerkleProof(trail, this.getEngine())
      return Some(proof)
    } catch (e) {
      console.error(e)
      return None<MerkleProof>()
    }
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
    // TODO ###
    const tree = '{}' // DEBUG
    return `{"options":${JSON.stringify(this.options)},"tree":${tree}}`
  }

  /**
   * @returns `true` if the current Merkle tree uses double hashing, `false` otherwise
   */
  public useDoubleHash(): boolean {
    return this.options.doubleHash
  }

  /**
   * Build a `MerkleTree` instance from the passed string
   * 
   * @param {string} str - The JSON-stringified representation of a full Merkle tree
   * @returns the built `MerkleTree` instance
   * @throws {InvalidJSONError}
   */
  public static fromJSON(str: string): MerkleTree {
    try {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
      const json = JSON.parse(str)
      const options = json.options !== undefined ? json.options as MerkleTreeOptions : MerkleTreeOptions()
      const tree = new MerkleTree(options)
      if (json.tree === undefined || Object.keys(json.tree).length === 0 && Object.getPrototypeOf(json.tree) === Object.prototype) {
        return tree
      }
      // TODO #########################
      console.log(json.tree) // DEBUG
      /* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
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

  private async make(): Promise<ReadonlyArray<MerkleProof>> {
    if (this.leaves.length === 0) {
      return Promise.reject(new Error('empty tree'))
    }
    // TODO ###
    return new Array<MerkleProof>() // DEBUG
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
