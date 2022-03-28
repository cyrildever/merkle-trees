package merkle_test

import (
	"testing"

	"github.com/cyrildever/merkle-trees/packages/go/model/merkle"
	"gotest.tools/assert"
)

// TestPath ...
func TestPath(t *testing.T) {
	size := 2
	var expected merkle.Path = "0"
	found, err := merkle.NewPath(1, size, 1)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, found, expected)

	size = 4
	expected = "10"
	found, err = merkle.NewPath(1, size, 2)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, found, expected)

	size = 5
	expected = "110"
	found, err = merkle.NewPath(1, size, 3)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, found, expected)

	expected = "101"
	found, err = merkle.NewPath(2, size, 3)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, found, expected)

	size = 9
	expected = "1110"
	found, err = merkle.NewPath(1, size, 4)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, found, expected)

	expected = "0111"
	found, err = merkle.NewPath(8, size, 4)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, found, expected)
}
