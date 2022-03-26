import { SHA_256 } from '..'

/**
 * Define the `MerkleTree` options
 * 
 * @param {boolean} doubleHash - Set to `true` to hash nodes twice (default: `false`)
 * @param {string} engine - The name of the hashing function (default: `'sha-256'`)
 * @param {boolean} sort - Set to `true` to lexicographically sort leaves (default: `false`)
 */
export interface MerkleTreeOptions {
  doubleHash: boolean
  engine: string
  sort: boolean
}

export const MerkleTreeOptions = (doubleHash?: boolean, engine?: string, sort?: boolean): MerkleTreeOptions => ({
  doubleHash: doubleHash !== undefined ? doubleHash : false,
  engine: engine !== undefined ? engine : SHA_256,
  sort: sort !== undefined ? sort : false
})
