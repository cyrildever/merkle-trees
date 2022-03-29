package com.cyrildever.hash

import scorex.crypto.hash._

object Hash {
  type Hash = Seq[Byte]
  type Hashes = Seq[Hash]

  // Supported hash functions
  final val SHA_256 = "sha-256"

  implicit class HashOps(h: Hash) {
    def toHex: String = h.map(b => f"$b%02x").mkString.toLowerCase
  }
  def fromHex(str: String): Hash = Hex.stringToSomeByteArray(str).getOrElse(Seq.empty)

  def buildHashFunction(engine: String, doubleHash: Boolean = false): Seq[Byte] => Hash =
    (item: Seq[Byte]) => engine match {
      case SHA_256 =>
        if (doubleHash) {
         Sha256.hash(Sha256(item.toArray))
        } else {
          Sha256.hash(item.toArray)
        }
      case _ => throw new Exception(s"""invalid engine: ${engine}""")
    }

  /**
   * Determine if it's a hash
   *
   * @param h The hash to test
   * @param engine The hashing function name, eg. `"sha-256"`
   * @return `true` if the passed hash is possibly a rightful hash
   */
  def isCorrectHash(h: Hash, engine: String): Boolean = engine match {
    case SHA_256 =>
      "^[a-f0-9]{64}$".r.findFirstMatchIn(h.toHex).isDefined
    case _ => false
  }

  /**
   * Lexicographically sort the hexadecimal representation of the passed hashes
   *
   * @param input The array of hashes to sort
   * @return a sorted array of hashes
   */
  def sortHashes(input: Hashes): Hashes = {
    input.sortWith((h1, h2) =>  h1.toHex.compareTo(h2.toHex) < 0)
  }
}
