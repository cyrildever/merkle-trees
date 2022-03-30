package com.cyrildever.merkle

/**
 * Path utility
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 */
object Path {
  type Path = String

  val LEFT = '1'
  val RIGHT = '0'

  /**
   * Build the left-right path from the root to the leaf at the passed index, ie. {{{
   *        (rootHash)
   *           /  \
   *         ()   hash2
   *        /  \
   *    hash1  (leaf)
   *
   * -> Path = "10"
   * }}}
   *
   * NB: Building with left = 1 and right = 0 allows to easily build the proof using the corresponding index for each level top-down
   *
   * @param index The leaf index
   * @param size The size of the Merkle tree
   * @param depth The depth of the Merkle tree
   * @return the path code
   */
  def buildPath(index: Int, size: Int, depth: Int): Path = {
    val pathBuilder = new StringBuilder("")
    val initialDepth = depth
    var currentIndex = index
    var currentSize = size
    var currentDepth = depth
    while (currentSize > 0 && currentDepth > 0) {
      val half = halfBucket(currentSize)
      if (currentIndex < half) {
        pathBuilder += LEFT
        currentSize = math.max(half, 1).toInt
      } else {
        pathBuilder += RIGHT
        currentIndex = (currentIndex - half).toInt
        currentSize = (if (currentSize - half * 2 == 0) math.max(half, 1) else currentSize - half).toInt
      }
      currentDepth = currentDepth - 1
    }
    val path = pathBuilder.toString
    if (path.length != initialDepth) {
      throw new Exception(s"""unable to build path, found: ${path}""")
    }
    path
  }

  // For internal use only

  private def halfBucket(from: Int): Double =
    math.pow(2, math.ceil(math.log(from.toDouble) / math.log(2))) / 2

}
