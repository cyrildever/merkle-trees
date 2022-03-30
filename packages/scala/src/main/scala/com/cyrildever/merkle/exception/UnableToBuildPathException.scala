package com.cyrildever.merkle.exception

case class UnableToBuildPathException(msg: String) extends Exception(s"""unable to build path, found: $msg""")
