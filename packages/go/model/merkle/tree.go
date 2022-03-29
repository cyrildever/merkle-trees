package merkle

import (
	"bytes"
	"fmt"
	"strconv"

	utls "github.com/cyrildever/go-utls/common/utils"
	"github.com/cyrildever/merkle-trees/packages/go/exception"
	"github.com/cyrildever/merkle-trees/packages/go/model/hash"
)

//--- TYPES

// Tree
type Tree struct {
	isReady      bool
	hashFunction hash.Function
	leaves       hash.Hashes
	leavesHex    []string
	levels       []hash.Hashes
	options      *TreeOptions
}

//--- METHODS

// AddLeaves adds either sources (by passing `true` to the first parameter) or hashes
func (t *Tree) AddLeaves(doHash bool, data ...[]byte) (proofs []*Proof, err error) {
	t.isReady = false
	if len(data) == 0 {
		err = fmt.Errorf("empty tree")
		return
	}
	leaves := hash.Hashes{}
	for _, d := range data {
		if doHash {
			if h := t.hashFunction(d); h != nil {
				leaves = append(leaves, h)
			}
		} else {
			if hash.IsCorrect(d, t.GetEngine()) {
				leaves = append(leaves, d)
			}
		}
	}
	if t.options.Sort {
		leaves = hash.SortHashes(leaves)
	}
	t.leaves = leaves
	leavesHex := []string{}
	for _, leaf := range t.leaves {
		leavesHex = append(leavesHex, utls.ToHex(leaf))
	}
	t.leavesHex = leavesHex
	return t.make()
}

// Depth returns the depth of the tree, ie. the number of levels excluding the root hash
func (t *Tree) Depth() (depth int, err error) {
	if !t.isReady {
		err = exception.NewTreeNotBuiltError()
		return
	}
	depth = len(t.levels) - 1
	return
}

// GetEngine returns the name of the used hashing function
func (t *Tree) GetEngine() string {
	return t.options.Engine
}

// GetProof retrieves the proof in the current Merkle tree for the passed hash
func (t *Tree) GetProof(leaf hash.Hash) (p *Proof, found bool) {
	if !t.isReady {
		return
	}
	index := indexOf(leaf, t.leaves)
	if index == -1 {
		return
	}
	depth, err := t.Depth()
	if err != nil {
		return
	}
	path, err := NewPath(index, t.Size(), depth)
	if err != nil {
		return
	}
	trail := hash.Hashes{}
	for level, idx := range path {
		if i, err := strconv.Atoi(string(idx)); err == nil {
			trail = append(trail, t.levels[level+1][i])
		}
	}
	if len(trail) == 0 {
		return
	}
	return NewProof(trail, path, t.Size(), t.GetEngine()), true
}

// GetRootHash returns the hexadecimal representation of the root hash of the current Merkle tree
func (t *Tree) GetRootHash() (rootHash string, err error) {
	if !t.isReady {
		err = exception.NewTreeNotBuiltError()
		return
	}
	rootHash = utls.ToHex(t.levels[0][0])
	return
}

// IsSorted returns `true` if the current Merkle tree leaves are sorted, `false` otherwise
func (t *Tree) IsSorted() bool {
	return t.options.Sort
}

// Size returns the number of leaves
func (t *Tree) Size() int {
	return len(t.leaves)
}

// UseDoubleHash returns `true` if the current Merkle tree uses double hashing, `false` otherwise
func (t *Tree) UseDoubleHash() bool {
	return t.options.DoubleHash
}

// For internal use only

func (t *Tree) make() (proofs []*Proof, err error) {
	if len(t.leaves) == 0 {
		err = fmt.Errorf("empty tree")
		return
	}

	// Build the actual tree
	t.levels = append([]hash.Hashes{t.leaves}, t.levels...)
	for len(t.levels[0]) > 1 {
		t.levels = append([]hash.Hashes{t.nextLevel()}, t.levels...)
	}
	if len(t.levels) == 0 {
		err = fmt.Errorf("empty tree")
		return
	}
	t.isReady = true

	// Retrieve the proofs
	for _, leaf := range t.leaves {
		if proof, found := t.GetProof(leaf); found {
			proofs = append(proofs, proof)
		} else {
			err = fmt.Errorf("unable to retrive proof")
			return
		}
	}

	return
}

func (t *Tree) nextLevel() hash.Hashes {
	nodes := hash.Hashes{}
	fromLevel := t.levels[0]
	fromLevelCount := len(fromLevel)
	for i := 0; i < fromLevelCount; i += 2 {
		if i+1 <= fromLevelCount-1 {
			nodes = append(nodes, t.hashFunction(append(fromLevel[i], fromLevel[i+1]...)))
		} else {
			// Odd number promoted to the next level
			nodes = append(nodes, fromLevel[i])
		}
	}
	return nodes
}

//--- FUNCTIONS

// NewTree instantiates a new Merkle tree
func NewTree(options ...*TreeOptions) (t *Tree, err error) {
	opts := DEFAULT_TREE_OPTIONS
	if len(options) == 1 && options[0] != nil {
		opts = options[0]
	}
	hFn, err := hash.BuildFunction(opts.Engine, opts.DoubleHash)
	if err != nil {
		return
	}
	return &Tree{
		isReady:      false,
		hashFunction: hFn,
		leaves:       hash.Hashes{},
		leavesHex:    []string{},
		levels:       []hash.Hashes{},
		options:      opts,
	}, nil
}

//--- utility

func indexOf(item hash.Hash, slice hash.Hashes) int {
	for k, v := range slice {
		if bytes.Equal(item, v) {
			return k
		}
	}
	return -1
}
