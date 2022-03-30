package com.cyrildever.merkle.exception

final case class InvalidEngineException(msg: String) extends Exception(s"""invalid engine: $msg""")
