package com.cyrildever.merkle.tree

import com.cyrildever.merkle.hash.Hash.SHA_256

/**
 * Define the `MerkleTree` options
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 *
 * @param doubleHash Set to `true` to hash nodes twice (default: `false`)
 * @param engine The name of the hashing function (default: `"sha-256"`)
 * @param sort Set to `true` to lexicographically sort leaves (default: `false`)
 */
case class Options(doubleHash: Boolean = false, engine: String = SHA_256, sort: Boolean = false)
