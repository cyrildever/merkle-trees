package com.cyrildever.merkle

import com.cyrildever.BasicUnitSpecs
import com.cyrildever.merkle.hash.Hash
import com.cyrildever.merkle.hash.Hash.{Hashes, SHA_256}
import com.cyrildever.merkle.exception.InvalidMerkleProofException
import java.util.Base64

/**
 * ProofSpecs test class
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 */
class ProofSpecs extends BasicUnitSpecs {
  "Proof.toString" should "print the appropriate proof" in {
    val hashes: Hashes = Seq(
      Hash.fromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"),
      Hash.fromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")
    )
    val proof = Proof(hashes, "101", 5)
    val expected = Base64.getEncoder.encodeToString("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789.101.sha-256.5".getBytes)
    val found = proof.toString
    found should equal (expected)
  }

  "Proof.from" should "rebuild the appropriate Merkle proof" in {
    val proof = "MTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZmFiY2RlZjAxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODkuMTAxLnNoYS0yNTYuNQ=="
    val found = Proof.from(proof)
    found.engine should equal (SHA_256)
    found.path should equal ("101")
    found.size should equal (5)
    found.trail should have length(2)
    found.trail.head should equal (Hash.fromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"))
    found.trail(1) should equal (Hash.fromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"))
    found.toString should equal (proof)

    val invalid = "not-a-valid-proof"
    the [InvalidMerkleProofException] thrownBy {
      Proof.from(invalid)
    } should have message s"""invalid proof: $invalid"""
  }
}
