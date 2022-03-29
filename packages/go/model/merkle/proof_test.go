package merkle_test

import (
	"bytes"
	"testing"

	utls "github.com/cyrildever/go-utls/common/utils"
	"github.com/cyrildever/merkle-trees/packages/go/model/hash"
	"github.com/cyrildever/merkle-trees/packages/go/model/merkle"
	"gotest.tools/assert"
)

// TestMerkleProof ...
func TestMerkleProof(t *testing.T) {
	// Base64("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789.101.sha-256.5")
	ref := "MTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZmFiY2RlZjAxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODkuMTAxLnNoYS0yNTYuNQ=="

	hashes := hash.Hashes{
		utls.Must(utls.FromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")),
		utls.Must(utls.FromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")),
	}
	proof := merkle.NewProof(hashes, "101", 5)
	found := proof.String()
	assert.Equal(t, found, ref)

	instance, err := merkle.ProofFrom(ref)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, instance.Engine, hash.SHA_256)
	assert.Equal(t, instance.Path, "101")
	assert.Equal(t, instance.Size, 5)
	assert.Assert(t, bytes.Equal(instance.Trail[0], utls.Must(utls.FromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"))))
	assert.Assert(t, bytes.Equal(instance.Trail[1], utls.Must(utls.FromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"))))
	assert.Equal(t, instance.String(), ref)

	_, err = merkle.ProofFrom("not-a-valid-proof")
	assert.Error(t, err, "invalid proof: not-a-valid-proof")
}
