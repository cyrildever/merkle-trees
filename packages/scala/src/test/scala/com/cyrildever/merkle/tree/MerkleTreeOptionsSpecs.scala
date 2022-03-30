package com.cyrildever.merkle.tree

import com.cyrildever.BasicUnitSpecs
import com.cyrildever.merkle.hash.Hash.SHA_256

/**
 * MerkleTreeOptionsSpecs test class
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 */
class MerkleTreeOptionsSpecs extends BasicUnitSpecs {
  "MerkleTreeOptions" should "use the default values" in {
    val found = MerkleTreeOptions()
    found.doubleHash shouldBe false
    found.engine should equal (SHA_256)
    found.sort shouldBe false

    val defaultOptions = found.toJSON
    defaultOptions should equal (s"""{"doubleHash":false,"engine":"sha-256","sort":false}""")
  }
}
