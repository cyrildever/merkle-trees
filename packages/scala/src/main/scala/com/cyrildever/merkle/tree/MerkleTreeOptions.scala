package com.cyrildever.merkle.tree

import com.cyrildever.merkle.hash.Hash.SHA_256
import org.json4s.JsonDSL._
import org.json4s.jackson.JsonMethods._

/**
 * Define the options for a `MerkleTree` instance
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 *
 * @param doubleHash Set to `true` to hash nodes twice (default: `false`)
 * @param engine The name of the hashing function (default: `"sha-256"`)
 * @param sort Set to `true` to lexicographically sort leaves (default: `false`)
 */
case class MerkleTreeOptions(doubleHash: Boolean = false, engine: String = SHA_256, sort: Boolean = false) {

  /**
   * @return the JSON-stringified representation of the options
   */
  def toJSON: String =
    compact(render(("doubleHash" -> doubleHash) ~ ("engine" -> engine) ~ ("sort" -> sort)))

}
object MerkleTreeOptions {
  val DEFAULT: MerkleTreeOptions = MerkleTreeOptions()
}
