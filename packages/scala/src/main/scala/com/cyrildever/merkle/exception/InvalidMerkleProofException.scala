package com.cyrildever.merkle.exception

final case class InvalidMerkleProofException(msg: String) extends Exception(s"""invalid proof: $msg""")
