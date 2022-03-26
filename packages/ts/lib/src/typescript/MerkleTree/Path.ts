import { UnableToBuildPathError } from '..'

export type Path = string

export const LEFT = '1'
export const RIGHT = '0'

const halfBucket = (from: number): number =>
  Math.pow(2, Math.ceil(Math.log(from) / Math.log(2))) / 2

/**
 * Build the left-right path from the root to the leaf at the passed index, ie.
 *
 *         (rootHash)
 *          /  \
 *         ()   hash2
 *        /  \
 *    hash1  (leaf)
 * 
 * => Path = '10'
 * 
 * NB: Building with left = 1 and right = 0 allows to easily build the proof using the corresponding index for each level top-down
 *  
 * @param {number} index - The leaf index
 * @param {number} size - The size of the Merkle tree
 * @param {number} depth - The depth of the Merkle tree
 * @returns the path code
 */
export const buildPath = (index: number, size: number, depth: number): Path => {
  let path = ''
  const initialDepth = depth
  // eslint-disable-next-line no-loops/no-loops
  while (size > 0 && depth > 0) {
    const half = halfBucket(size)
    if (index < half) {
      path += LEFT
      size = Math.max(half, 1)
    } else {
      path += RIGHT
      index -= half
      if (size - half * 2 === 0) {
        size = Math.max(half, 1)
      } else {
        size = size - half
      }
    }
    depth--
  }
  if (path.length !== initialDepth) {
    throw new UnableToBuildPathError(path)
  }
  return path
}
