package com.cyrildever.merkle.exception

case class InvalidMerkleProofException(msg: String) extends Exception(s"""invalid proof: $msg""")
