package com.cyrildever.merkle

import com.cyrildever.BasicUnitSpecs

/**
 * PathSpecs test class
 *
 * @author  Cyril Dever
 * @since   1.0
 * @version 1.0
 */
class PathSpecs extends BasicUnitSpecs {
  import Path._

  "Path.buildPath" should "return the right path" in {
    var expected: Path = "0"
    var found = buildPath(1, 2, 1)
    found should equal (expected)

    expected = "10"
    found = buildPath(1, 4, 2)
    found should equal (expected)

    expected = "110"
    found = buildPath(1, 5, 3)
    found should equal (expected)

    expected = "101"
    found = buildPath(2, 5, 3)
    found should equal (expected)

    expected = "1110"
    found = buildPath(1, 9, 4)
    found should equal (expected)

    expected = "0111"
    found = buildPath(8, 9, 4)
    found should equal (expected)
  }
}
