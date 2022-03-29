package merkle_test

import (
	"testing"

	utls "github.com/cyrildever/go-utls/common/utils"
	"github.com/cyrildever/merkle-trees/packages/go/model/hash"
	"github.com/cyrildever/merkle-trees/packages/go/model/merkle"
	"gotest.tools/assert"
)

var sha256, _ = hash.BuildFunction(hash.SHA_256)

// TestAddLeaves ...
func TestAddLeaves(t *testing.T) {
	tree, err := merkle.NewTree()
	if err != nil {
		t.Fatal(err)
	}
	_, err = tree.AddLeaves(true)
	assert.Error(t, err, "empty tree")

	_, err = tree.AddLeaves(false, []byte("123"))
	assert.Error(t, err, "empty tree")
}

// TestGetProof ...
func TestGetProof(t *testing.T) {
	data := [][]byte{[]byte("data1"), []byte("data2"), []byte("data3"), []byte("data4"), []byte("data5")}
	tree, err := merkle.NewTree()
	if err != nil {
		t.Fatal(err)
	}
	proofs, err := tree.AddLeaves(true, data...)
	if err != nil {
		t.Fatal(err)
	}

	proof1, found := tree.GetProof(sha256([]byte("data1")))
	assert.Assert(t, found && proof1 != nil)
	assert.Equal(t, proof1.String(), proofs[0].String())

	proof2, found := tree.GetProof(sha256([]byte("data2")))
	assert.Assert(t, found && proof2 != nil)
	assert.Equal(t, proof2.Path, "110")
	assert.Equal(t, len(proof2.Trail), 3)
	assert.Equal(t, proof2.String(), proofs[1].String())

	proof5, found := tree.GetProof(sha256([]byte("data5")))
	assert.Assert(t, found && proof5 != nil)
	assert.Equal(t, proof5.String(), proofs[4].String())

	tree2, err := merkle.NewTree()
	if err != nil {
		t.Fatal(err)
	}
	_, err = tree2.AddLeaves(true, data...)
	if err != nil {
		t.Fatal(err)
	}
	proof1_2, _ := tree2.GetProof(sha256([]byte("data1")))
	assert.Equal(t, proof1_2.String(), proof1.String())
}

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
