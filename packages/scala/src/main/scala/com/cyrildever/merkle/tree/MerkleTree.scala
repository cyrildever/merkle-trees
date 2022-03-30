package com.cyrildever.merkle.tree

import com.cyrildever.merkle.Path._
import com.cyrildever.merkle.Proof
import com.cyrildever.merkle.exception.{EmptyTreeException, TreeNotBuiltException}
import com.cyrildever.merkle.hash.Hash._
import com.cyrildever.merkle.hash.HashFunction._
import org.json4s.JsonDSL._
import org.json4s.jackson.JsonMethods._

/**
 * Define a `MerkleTree`
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 * @param options The Merkle tree options
 */
case class MerkleTree(options: MerkleTreeOptions = MerkleTreeOptions.DEFAULT) {
  private var isReady: Boolean = false
  private val hashFunction: HashFunction = buildHashFunction(options.engine, options.doubleHash)
  private var leaves: Hashes = Seq[Hash]()
  private var leavesHex: Seq[String] = Seq[String]()
  private var levels: Seq[Hashes] = Seq[Hashes]()

  /**
   * Add leaves, either sources (by passing `true` to the first parameter) or hashes
   *
   * @param doHash Set to `true` to hash the passed source data
   * @param data The data to use as leaf
   * @return the corresponding array of `MerkleProof` for the data
   */
  @throws[EmptyTreeException]
  @throws[TreeNotBuiltException]
  def addLeaves(doHash: Boolean, data: Seq[Byte]*): Seq[Option[Proof]] = {
    isReady = false
    if (data.isEmpty) throw EmptyTreeException()
    else {
      leaves = sort(options.sort, if (doHash) data.map(hashFunction) else data.filter(isCorrectHash(_, getEngine)))
      leavesHex = leaves.map(_.toHex)
      make()
    }
  }

  /**
   * @return the depth of the tree, ie. the number of levels excluding the root hash
   */
  @throws[TreeNotBuiltException]
  def depth(): Int = if (isReady) levels.length - 1 else throw TreeNotBuiltException()

  /**
   * @return the name of the used hashing function
   */
  def getEngine: String = options.engine

  /**
   * Try and retrieve the proof in the current Merkle tree for the passed hash
   *
   * @param leaf The hashed data
   * @return some corresponding proof, or `None`
   */
  def getProof(leaf: Hash): Option[Proof] =
    if (!isReady) None
    else {
      val index = leaves.indexOf(leaf)
      if (index == -1) {
        None
      } else {
        val path = buildPath(index, size(), depth())
        val trail = path.toSeq.zipWithIndex.map { case (idx, level) => levels(level + 1)(idx.toString.toInt) }
        if (trail.nonEmpty) Some(Proof(trail, path, size(), getEngine)) else None
      }
    }

  /**
   * @return the hexadecimal representation of the root hash of the current Merkle tree
   */
  @throws[TreeNotBuiltException]
  def getRootHash: String = if (isReady) levels.head.head.toHex else throw TreeNotBuiltException()

  /**
   * @return `true` if the current Merkle tree leaves are sorted, `false` otherwise
   */
  def isSorted: Boolean = options.sort

  /**
   * @return the number of leaves
   */
  def size(): Int = leaves.length

  /**
   *  IMPORTANT: Use with caution!
   *
   * @return the JSON-stringified representation of the current Merkle tree
   */
  @throws[TreeNotBuiltException]
  def toJSON: String = if (isReady || leaves.isEmpty) {
    s"""{"options":${options.toJSON},"leaves":${compact(render(leavesHex))}}"""
  } else throw TreeNotBuiltException()

  /**
   * @return `true` if the current Merkle tree uses double hashing, `false` otherwise
   */
  def useDoubleHash: Boolean = options.doubleHash

  // For internal use only

  private def make(): Seq[Option[Proof]] =
    if (leaves.isEmpty) throw EmptyTreeException()
    else {
      levels = leaves +: levels
      while (levels.head.length > 1) {
        levels = nextLevel() +: levels
      }
      if (levels.isEmpty) throw EmptyTreeException()
      else {
        isReady = true
        leaves.map(getProof)
      }
    }

  private def nextLevel(): Hashes =
    Seq[Hash]() ++ {
      val fromLevel = levels.head
      val fromLevelCount = fromLevel.length
      for (i <- 0 until fromLevelCount by 2) yield {
        if (i + 1 <= fromLevelCount - 1) {
          hashFunction(fromLevel(i) ++ fromLevel(i + 1))
        } else {
          // Odd number promoted to the next level
          fromLevel(i)
        }
      }
    }

  private def sort(doSort: Boolean, leaves: Hashes): Hashes =
    if (doSort) sortHashes(leaves) else leaves

}
