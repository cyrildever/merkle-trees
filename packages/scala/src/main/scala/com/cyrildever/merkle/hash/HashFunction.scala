package com.cyrildever.merkle.hash

import com.cyrildever.merkle.exception.InvalidEngineException
import com.cyrildever.merkle.hash.Hash.{Hash, SHA_256}
import scorex.crypto.hash.Sha256

/**
 * HashFunction utility
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 */
object HashFunction {
  type HashFunction = Seq[Byte] => Hash

  @throws[InvalidEngineException]
  def buildHashFunction(engine: String, doubleHash: Boolean = false): HashFunction =
    (item: Seq[Byte]) => engine match {
      case SHA_256 =>
        if (doubleHash) {
          Sha256.hash(Sha256(item.toArray))
        } else {
          Sha256.hash(item.toArray)
        }
      case _ => throw InvalidEngineException(engine)
    }

}
