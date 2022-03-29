package merkle

import (
	"github.com/cyrildever/merkle-trees/packages/go/model/hash"
)

// TreeOptions ...
type TreeOptions struct {
	DoubleHash bool   `json:"doubleHash"`
	Engine     string `json:"engine"`
	Sort       bool   `json:"sort"`
}

// DEFAULT_TREE_OPTIONS sets double hash and sort to `false`, and engine to "sha-256"
var DEFAULT_TREE_OPTIONS = NewTreeOptions(false, hash.SHA_256, false)

// NewTreeOptions ...
func NewTreeOptions(doubleHash bool, engine string, sort bool) *TreeOptions {
	return &TreeOptions{
		DoubleHash: doubleHash,
		Engine:     engine,
		Sort:       sort,
	}
}
