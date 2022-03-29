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

// TestMerkleTreeFrom ...
func TestMerkleTreeFrom(t *testing.T) {
	_, err := merkle.TreeFrom(`{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":[]}`)
	assert.Error(t, err, "empty tree")

	json := `{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}`
	tree, err := merkle.TreeFrom(json)
	if err != nil {
		t.Fatal(err)
	}
	rootHash, err := tree.GetRootHash()
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, rootHash, "e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995")
	_, found := tree.GetProof(utls.Must(utls.FromHex("d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c")))
	assert.Assert(t, found)
}

// TestMerkleTreeJSON ...
func TestMerkleTreeJSON(t *testing.T) {
	empty, err := merkle.NewTree()
	if err != nil {
		t.Fatal(err)
	}
	json, err := empty.JSON()
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, json, `{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":[]}`)

	data := [][]byte{[]byte("data1"), []byte("data2"), []byte("data3"), []byte("data4"), []byte("data5")}
	tree, err := merkle.NewTree()
	if err != nil {
		t.Fatal(err)
	}
	_, err = tree.AddLeaves(true, data...)
	if err != nil {
		t.Fatal(err)
	}
	json, err = tree.JSON()
	if err != nil {
		t.Fatal(err)
	}
	expected := `{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}`
	assert.Equal(t, json, expected)
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
