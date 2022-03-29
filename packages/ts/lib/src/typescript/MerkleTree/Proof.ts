import { Hashes, InvalidMerkleProofError, Path, SHA_256 } from '..'

/**
 * The proof consists of the trail of intermediate hashes suffixed with the path, the name of the hashing engine used and the size of the Merkle tree at the date of the proof.
 * 
 * @param {Hashes} trail - The intermediate hashes bottom up (not including the final root hash)
 * @param {Path} path - The path from root to leaf
 * @param {number} size - The number of leaves in the Merkle tree at issuance of the proof
 * @param {string} engine - The name of the hashing function (default: `'sha-256'`)
 */
export interface MerkleProof {
  trail: Hashes
  path: Path
  engine: string
  size: number

  /**
   * Example of a Merkle tree showing the target leaf and the two intermediate hashes comprised in the trail of the proof:
   * 
   *        (rootHash)
   *           /  \
   *          ()   hash2
   *         /  \
   *     (leaf)  hash1
   * 
   * @returns the base64-encoded dot-separated concatenation of the hexadecimal hashes, the path, the engine and the size of the tree,
   * eg. Base64('&lt;hash1&gt;&lt;hash2&gt;.11.sha-256.4')
   */
  toString: () => string
}

const toString = (trail: Hashes, path: Path, size: number, engine: string) => (): string =>
  Buffer.from(`${Buffer.concat(trail).toString('hex')}.${path}.${engine}.${size}`).toString('base64')

export const MerkleProof = (trail: Hashes, path: Path, size: number, engine = SHA_256): MerkleProof => ({
  trail,
  path,
  size,
  engine,
  toString: toString(trail, path, size, engine)
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
    if (parts.length != 4) {
      throw new InvalidMerkleProofError(str)
    }
    const path = parts[1]
    const engine = parts[2]
    const size = parseInt(parts[3])
    if (size === 0) {
      throw new InvalidMerkleProofError(str)
    }
    switch (engine) {
      case SHA_256:
        const hashes = parts[0].split(/(.{64})/).filter(_ => _.length == 64).map(_ => Buffer.from(_, 'hex')) // eslint-disable-line no-case-declarations
        return MerkleProof(hashes, path, size, engine)
      default:
        throw new InvalidMerkleProofError(str)
    }
  } catch (_) {
    throw new InvalidMerkleProofError(str)
  }
}
