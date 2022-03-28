package model_test

import (
	"testing"

	utls "github.com/cyrildever/go-utls/common/utils"
	"github.com/cyrildever/merkle-trees/packages/go/model"
	"gotest.tools/assert"
)

// TestBuildHashFunction ...
func TestBuildHashFunction(t *testing.T) {
	expected := "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
	sha256, err := model.BuildHashFunction(model.SHA_256)
	if err != nil {
		t.Fatal(err)
	}
	found := sha256([]byte("test"))
	assert.Equal(t, utls.ToHex(found), expected)

	expected = "954d5a49fd70d9b8bcdb35d252267829957f7ef7fa6c74f88419bdc5e82209f4"
	doubleSha256, err := model.BuildHashFunction(model.SHA_256, true)
	if err != nil {
		t.Fatal(err)
	}
	found = doubleSha256([]byte("test"))
	assert.Equal(t, utls.ToHex(found), expected)
}

// TestIsCorrectHash ...
func TestIsCorrectHash(t *testing.T) {
	correct := utls.Must(utls.FromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"))
	found := model.IsCorrectHash(correct, model.SHA_256)
	assert.Assert(t, found)

	incorrect := []byte("incorrect")
	found = model.IsCorrectHash(incorrect, model.SHA_256)
	assert.Assert(t, !found)

	found = model.IsCorrectHash(correct, "wrong-engine")
	assert.Assert(t, !found)
}

// TestSortHashes ...
func TestSortHashes(t *testing.T) {
	hashes := model.Hashes{
		utls.Must(utls.FromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")),
		utls.Must(utls.FromHex("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")),
		utls.Must(utls.FromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")),
	}
	expected := model.Hashes{
		utls.Must(utls.FromHex("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")),
		utls.Must(utls.FromHex("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")),
		utls.Must(utls.FromHex("abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789")),
	}
	found := model.SortHashes(hashes)
	assert.DeepEqual(t, found, expected)
}
