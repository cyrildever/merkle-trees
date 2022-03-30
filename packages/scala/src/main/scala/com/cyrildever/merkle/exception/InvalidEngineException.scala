package com.cyrildever.merkle.exception

case class InvalidEngineException(msg: String) extends Exception(s"""invalid engine: $msg""")
