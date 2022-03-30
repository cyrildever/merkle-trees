package com.cyrildever.merkle.exception

final case class InvalidJSONException(msg: String, cause: Throwable) extends Exception(msg, cause)
