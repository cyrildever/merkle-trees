package com.cyrildever.merkle.hash

import com.cyrildever.BasicUnitSpecs

/**
 * HashSpecs test class
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 */
class HashSpecs extends BasicUnitSpecs {
  import Hash._

  "Hash.buildHashFunction" should "return the right SHA-256 function" in {
    val sha256 = buildHashFunction(SHA_256)
    val expected = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    val found = sha256("test".getBytes)
    found.toHex should equal (expected)

    val doubleSha256 = buildHashFunction(SHA_256, true)
    val expected2 = "954d5a49fd70d9b8bcdb35d252267829957f7ef7fa6c74f88419bdc5e82209f4"
    val found2 = doubleSha256("test".getBytes)
    found2.toHex should equal (expected2)
  }

  "Hash.isCorrect" should "know when it is a correct hash" in {
    val correct = Hash.fromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
    val found = isCorrectHash(correct, SHA_256)
    found should be (true)
  }
  it should "detect an incorrect hash" in {
    val incorrect = "incorrect".getBytes
    val found = isCorrectHash(incorrect, SHA_256)
    found should be (false)
  }

  "Hash.sortHashes" should "sort hashes lexicographically" in {
    val hashes = Seq(
      Hash.fromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"),
      Hash.fromHex("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),
      Hash.fromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    )
    val expected = Seq(
      Hash.fromHex("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),
      Hash.fromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      Hash.fromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")
    )

    val found = sortHashes(hashes)
    found should have length (3)
    found(0).toHex should equal("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")
    found should equal (expected)
  }
}
