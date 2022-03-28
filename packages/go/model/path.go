package model

import (
	"math"

	"github.com/cyrildever/merkle-trees/packages/go/exception"
)

// Path ...
type Path string

const (
	LEFT  = "1"
	RIGHT = "0"
)

// NewPath builds the left-right path from the root to the leaf at the passed `index` for the tree's `size` and `depth`, ie.
//
//			(rootHash)
//				/ \
//			  ()   hash2
//			 /  \
//		hash1	(leaf)
//
// => Path = "10"
//
// NB: Building with left = 1 and right = 0 allows to easily build the proof using the corresponding index for each level top-down
func NewPath(index, size, depth int) (path Path, err error) {
	initialDepth := depth
	for size > 0 && depth > 0 {
		half := halfBucket(float64(size))
		if float64(index) < half {
			path += LEFT
			size = int(math.Max(half, 1))
		} else {
			path += RIGHT
			index -= int(half)
			if size-int(half)*2 == 0 {
				size = int(math.Max(half, 1))
			} else {
				size -= int(half)
			}
		}
		depth--
	}
	if len(path) != initialDepth {
		err = exception.NewUnableToBuildPathError(string(path))
	}
	return
}

//-- utility

func halfBucket(from float64) float64 {
	return math.Pow(2, math.Ceil(math.Log(from)/math.Log(2))) / 2
}
