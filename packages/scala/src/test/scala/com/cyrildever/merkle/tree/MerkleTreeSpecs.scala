package com.cyrildever.merkle.tree

import com.cyrildever.BasicUnitSpecs
import com.cyrildever.merkle.exception._
import com.cyrildever.merkle.hash.Hash._
import com.cyrildever.merkle.hash.HashFunction._

/**
 * MerkleTreeSpecs test class
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 */
class MerkleTreeSpecs extends BasicUnitSpecs {
  val sha256: HashFunction = buildHashFunction(SHA_256)

  "MerkleTree.addLeaves" should "fail if the tree remains empty" in {
    val tree = MerkleTree()

    the [EmptyTreeException] thrownBy {
      tree.addLeaves(true)
    } should have message "empty tree"

    the [EmptyTreeException] thrownBy {
      tree.addLeaves(false, "123".getBytes)
    } should have message "empty tree"
  }

  "MerkleTree.depth" should "return the correct depth or throw an error" in {
    val tree = MerkleTree()

    the [TreeNotBuiltException] thrownBy {
      tree.depth()
    } should have message "tree not built"

    val hashes: Hashes = Seq(
      fromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"),
      fromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")
    )
    tree.addLeaves(false, hashes: _*)
    val found = tree.depth()
    found should equal (1)
  }

  "MerkleTree.getProof" should "be deterministic" in {
    val data: Hashes = Seq("data1", "data2", "data3", "data4", "data5").map(_.getBytes).map(_.toSeq)
    val tree = MerkleTree()
    val maybeProofs = tree.addLeaves(true, data: _*)

    val proof1 = tree.getProof(sha256("data1".getBytes))
    proof1.isDefined shouldBe true
    proof1.get.toString should equal (maybeProofs(0).get.toString)

    val proof2 = tree.getProof(sha256("data2".getBytes))
    proof2.isDefined shouldBe true
    proof2.get.path should equal ("110")
    proof2.get.trail should have size 3
    proof2.get.toString should equal (maybeProofs(1).get.toString)

    val proof5 = tree.getProof(sha256("data5".getBytes))
    proof5.isDefined shouldBe true
    proof5.get.toString should equal (maybeProofs(4).get.toString)

    val tree2 = MerkleTree()
    tree2.addLeaves(true, data: _*)
    val proof1_2 = tree2.getProof(sha256("data1".getBytes))
    proof1_2.get.toString should equal (proof1.get.toString)
  }

  "MerkleTree.fromJSON" should "create the right JSON" in {
    val empty = s"""{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":[]}"""
    the [InvalidJSONException] thrownBy {
      MerkleTree.fromJSON(empty)
    } should have message "empty tree"

    val json = s"""{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}"""
    val found = MerkleTree.fromJSON(json)
    found.getRootHash should equal ("e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995")
    val proof = found.getProof(fromHex("d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c"))
    proof.isDefined shouldBe true
  }

  "MerkleTree.toJSON" should "build the appropriate JSON" in {
    val empty = MerkleTree()
    empty.toJSON should equal (s"""{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":[]}""")

    val data: Hashes = Seq("data1", "data2", "data3", "data4", "data5").map(_.getBytes).map(_.toSeq)
    val tree = MerkleTree()
    tree.addLeaves(true, data: _*)
    val expected = s"""{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}"""
    val found = tree.toJSON
    found should equal (expected)
  }
}
