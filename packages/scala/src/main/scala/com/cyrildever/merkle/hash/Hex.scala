package com.cyrildever.merkle.hash

/**
 * Hex utility
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 */
object Hex {
  def byteArrayToHexString(bytes: Seq[Byte]): String = bytes.map(b => f"$b%02x").mkString.toLowerCase

  def stringToSomeByteArray(hex: String): Option[Seq[Byte]] = try {
    Some(hex.sliding(2,2).toArray.map(Integer.parseInt(_, 16).toByte))
  } catch {
    case _: Exception => None
  }
}
