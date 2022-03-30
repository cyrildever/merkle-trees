package com.cyrildever.merkle.exception

final case class UnableToBuildPathException(msg: String) extends Exception(s"""unable to build path, found: $msg""")
