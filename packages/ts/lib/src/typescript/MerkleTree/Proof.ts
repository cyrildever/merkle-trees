import { InvalidMerkleProofError } from '../Error'
import { Hash, SHA_256 } from '../Hash'

/**
 * The proof consists of the trail of intermediate hashes prefixed with the name of the hashing engine used.
 * 
 * @param {Hash[]} trail - The intermediate hashes bottom up (not including the final root hash)
 * @param {string} engine - The name of the hashing function (default: `'sha-256'`)
 */
export interface MerkleProof {
  trail: ReadonlyArray<Hash>
  engine: string

  /**
   * Example of Merkle tree showing the target leaf and the two intermediate hashes comprised in the trail of the proof:
   * 
   *        (rootHash)
   *           /  \
   *          ()   hash2
   *         /  \
   *     (leaf)  hash1
   * 
   * @returns the base64-encoded concatenation of the engine and the hexadecimal hashes, eg. Base64('sha-256.&lt;hash1&gt;&lt;hash2&gt;')
   */
  toString: () => string
}

const toString = (trail: ReadonlyArray<Hash>, engine: string) => (): string =>
  Buffer.from(`${engine}.${Buffer.concat(trail).toString('hex')}`).toString('base64')

export const MerkleProof = (trail: ReadonlyArray<Hash>, engine = SHA_256): MerkleProof => ({
  trail,
  engine,
  toString: toString(trail, engine)
})

/**
 * Build a `MerkleProof` from the passed string, provided it's an actual stringified proof
 * 
 * @param {string} str - The base64-encoded proof
 * @returns the corresponding `MerkleProof` instance
 * @throws InvalidMerkleProofError
 */
export const merkleProofFrom = (str: string): MerkleProof => {
  try {
    const decoded = Buffer.from(str, 'base64').toString()
    const parts = decoded.split('.')
    if (parts.length != 2) {
      throw new InvalidMerkleProofError(str)
    }
    const engine = parts[0]
    switch (engine) {
      case SHA_256:
        const hashes = parts[1].split(/(.{64})/).filter(_ => _.length == 64).map(_ => Buffer.from(_, 'hex')) // eslint-disable-line no-case-declarations
        return MerkleProof(hashes, engine)
      default:
        throw new InvalidMerkleProofError(str)
    }
  } catch (_) {
    throw new InvalidMerkleProofError(str)
  }
}
