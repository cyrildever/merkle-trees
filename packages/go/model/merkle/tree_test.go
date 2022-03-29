package merkle_test

import (
	"testing"

	utls "github.com/cyrildever/go-utls/common/utils"
	"github.com/cyrildever/merkle-trees/packages/go/model/hash"
	"github.com/cyrildever/merkle-trees/packages/go/model/merkle"
	"gotest.tools/assert"
)

// TestMerkleTreeDepth ...
func TestMerkleTreeDepth(t *testing.T) {
	tree, err := merkle.NewTree()
	if err != nil {
		t.Fatal(err)
	}
	_, err = tree.Depth()
	assert.Error(t, err, "tree not built")

	hashes := hash.Hashes{
		utls.Must(utls.FromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")),
		utls.Must(utls.FromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")),
	}
	_, err = tree.AddLeaves(false, hashes...)
	if err != nil {
		t.Fatal(err)
	}
	depth, err := tree.Depth()
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, depth, 1)
}
