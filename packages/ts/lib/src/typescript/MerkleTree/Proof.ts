import { InvalidMerkleProofError } from '../Error'
import { Hash, SHA_256 } from '../Hash'
import { Path } from './Path'

/**
 * The proof consists of the trail of intermediate hashes prefixed with the name of the hashing engine used.
 * 
 * @param {Hash[]} trail - The intermediate hashes bottom up (not including the final root hash)
 * @param {Path} path - The path from root to leaf
 * @param {string} engine - The name of the hashing function (default: `'sha-256'`)
 */
export interface MerkleProof {
  trail: ReadonlyArray<Hash>
  path: Path
  engine: string

  /**
   * Example of a Merkle tree showing the target leaf and the two intermediate hashes comprised in the trail of the proof:
   * 
   *        (rootHash)
   *           /  \
   *          ()   hash2
   *         /  \
   *     (leaf)  hash1
   * 
   * @returns the base64-encoded concatenation of the path, the engine and the hexadecimal hashes, eg. Base64('11.sha-256.&lt;hash1&gt;&lt;hash2&gt;')
   */
  toString: () => string
}

const toString = (trail: ReadonlyArray<Hash>, path: Path, engine: string) => (): string =>
  Buffer.from(`${path}.${engine}.${Buffer.concat(trail).toString('hex')}`).toString('base64')

export const MerkleProof = (trail: ReadonlyArray<Hash>, path: Path, engine = SHA_256): MerkleProof => ({
  trail,
  path,
  engine,
  toString: toString(trail, path, engine)
})

/**
 * Build a `MerkleProof` from the passed string, provided it's an actual stringified proof
 * 
 * @param {string} str - The base64-encoded proof
 * @returns the corresponding `MerkleProof` instance
 * @throws {InvalidMerkleProofError}
 */
export const merkleProofFrom = (str: string): MerkleProof => {
  try {
    const decoded = Buffer.from(str, 'base64').toString()
    const parts = decoded.split('.')
    if (parts.length != 3) {
      throw new InvalidMerkleProofError(str)
    }
    const path = parts[0]
    const engine = parts[1]
    switch (engine) {
      case SHA_256:
        const hashes = parts[2].split(/(.{64})/).filter(_ => _.length == 64).map(_ => Buffer.from(_, 'hex')) // eslint-disable-line no-case-declarations
        return MerkleProof(hashes, path, engine)
      default:
        throw new InvalidMerkleProofError(str)
    }
  } catch (_) {
    throw new InvalidMerkleProofError(str)
  }
}
