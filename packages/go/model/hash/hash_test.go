package hash_test

import (
	"testing"

	utls "github.com/cyrildever/go-utls/common/utils"
	"github.com/cyrildever/merkle-trees/packages/go/model/hash"
	"gotest.tools/assert"
)

// TestIsCorrectHash ...
func TestIsCorrectHash(t *testing.T) {
	correct := utls.Must(utls.FromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"))
	found := hash.IsCorrect(correct, hash.SHA_256)
	assert.Assert(t, found)

	incorrect := []byte("incorrect")
	found = hash.IsCorrect(incorrect, hash.SHA_256)
	assert.Assert(t, !found)

	found = hash.IsCorrect(correct, "wrong-engine")
	assert.Assert(t, !found)
}

// TestSortHashes ...
func TestSortHashes(t *testing.T) {
	hashes := hash.Hashes{
		utls.Must(utls.FromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")),
		utls.Must(utls.FromHex("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")),
		utls.Must(utls.FromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")),
	}
	expected := hash.Hashes{
		utls.Must(utls.FromHex("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")),
		utls.Must(utls.FromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")),
		utls.Must(utls.FromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")),
	}
	found := hash.SortHashes(hashes)
	assert.Equal(t, len(found), 3)
	assert.Equal(t, utls.ToHex(found[0]), "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")
	assert.DeepEqual(t, found, expected)
}
