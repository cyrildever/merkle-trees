import {
  buildHashFunction, Hash, HashFunction, ImpossibleToSortError, InvalidJSONError, isCorrectHash, MerkleProof, MerkleTreeOptions, sortHashes
} from '..'

export class MerkleTree {
  private readonly hashFunction: HashFunction
  private leaves: ReadonlyArray<Hash>
  private readonly options: MerkleTreeOptions

  constructor(options?: MerkleTreeOptions) {
    this.leaves = new Array<Buffer>()
    this.options = options !== undefined ? options : MerkleTreeOptions()
    this.hashFunction = buildHashFunction(this.options.engine, this.options.doubleHash)
  }

  /**
   * Add leaves, either sources to hash (by passing `true` to the first parameter) or hashes
   * 
   * @param {boolean} doHash - Set to `true` to hash the passed source data (default: `false`)
   * @param {Buffer[]} data - The data to use as leaf
   * @returns a promise of the corresponding array of `MerkleProof` for the data
   * @throws {ImpossibleToSortError}
   */
  public async addLeaves(doHash = false, ...data: Array<Buffer>): Promise<ReadonlyArray<MerkleProof>> {
    if (data.length === 0) {
      return new Array<MerkleProof>()
    }
    this.leaves = this.leaves.concat(doHash ? await Promise.all(data.map(this.hashFunction)) : data.filter(_ => isCorrectHash(_, this.options.engine)))
    if (this.options.sort) {
      if (!this.sort()) {
        throw new ImpossibleToSortError()
      }
    }
    return this.make()
  }

  /**
   * @returns the name of the used hashing function
   */
  public getEngine(): string {
    return this.options.engine
  }

  /**
   * @returns `true` if the current Merkle tree leaves are sorted
   */
  public isSorted(): boolean {
    return this.options.sort
  }

  /**
   * IMPORTANT: Use with caution!
   * 
   * @returns the JSON-stringified representation of the current Merkle tree
   */
  public toJSON(): string {
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
