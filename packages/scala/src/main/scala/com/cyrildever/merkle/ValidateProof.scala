package com.cyrildever.merkle

/**
 * ValidateProof is the main application entry point
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 * @example {{{
 *  $ sbt assembly && java -cp target/scala-2.12/merkle-tree-1.0.0.jar com.cyrildever.merkle.ValidateProof '' '' '' ''
 * }}}
 */
object ValidateProof extends App {
  try {
    println("")
    println("COPYRIGHT NOTICE")
    println("================")
    println("This is my implementation of Merkle tree for the JVM in Scala. It's available under a MIT license.")
    println("")
    println("© 2022 Cyril Dever. All rights reserved.")
    println("")
  } catch {
    case e: Exception =>
      println(e)
      e.getStackTrace foreach println
      System.exit(1)
  }
}
