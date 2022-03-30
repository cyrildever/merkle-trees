package com.cyrildever.merkle

import com.cyrildever.merkle.hash.Hash._
import com.cyrildever.merkle.Path.Path
import com.cyrildever.merkle.exception.InvalidMerkleProofException
import java.nio.charset.StandardCharsets
import java.util.Base64

/**
 * The proof consists of the trail of intermediate hashes suffixed with the path, the name of the hashing engine used
 * and the size of the Merkle tree at the date of the proof.
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 *
 * @param trail The intermediate hashes bottom up (not including the final root hash)
 * @param path The path from root to leaf
 * @param size The number of leaves in the Merkle tree at issuance of the proof
 * @param engine The name of the hashing function (default: `"sha-256"`)
 */
case class Proof(trail: Hashes, path: Path, size: Int, engine: String = SHA_256) {

  /**
   * Example of a Merkle tree showing the target leaf and the two intermediate hashes comprised in the trail of the proof: {{{
   *        (rootHash)
   *           /  \
   *          ()   hash2
   *         /  \
   *     (leaf)  hash1
   * }}}
   * @return the base64-encoded dot-separated concatenation of the hexadecimal hashes, the path, the engine and the size of the tree,
   * eg. {{{ Base64.encode("<hash1><hash2>.11.sha-256.4") }}}
   */
  override def toString: String =
    Base64.getEncoder.encodeToString(s"""${trail.map(_.toHex).mkString}.$path.$engine.${size.toString}""".getBytes(StandardCharsets.UTF_8))

}
object Proof {

  /**
   * Build a `MerkleProof` from the passed string, provided it's an actual stringified proof
   *
   * @param str The base64-encoded proof
   * @return the corresponding `merkle.Proof` instance
   */
  @throws[InvalidMerkleProofException]
  def from(str: String): Proof = try {
    val parts = new String(Base64.getDecoder.decode(str), StandardCharsets.UTF_8).split("\\.")
    val path = parts(1)
    val engine = parts(2)
    val size = parts(3).toInt
    engine match {
      case SHA_256 =>
        val trail: Hashes = parts.head.grouped(64).map(fromHex).toSeq
        Proof(trail, path, size, engine)
      case _ => throw InvalidMerkleProofException(str)
    }
  } catch {
    case _: Exception => throw InvalidMerkleProofException(str)
  }

}
