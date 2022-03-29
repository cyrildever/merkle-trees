package hash

import (
	"sort"

	utls "github.com/cyrildever/go-utls/common/utils"
)

// Hash ...
type Hash = []byte

// Hashes ...
type Hashes = []Hash

// IsCorrect ...
func IsCorrect(h []byte, engine string) bool {
	switch engine {
	case SHA_256:
		return regexSha256.MatchString(utls.ToHex(h))
	default:
		return false
	}
}

// SortHashes lexicographically sort the passed hashes
func SortHashes(input Hashes) Hashes {
	sort.SliceStable(input, func(i, j int) bool {
		return string(input[i]) < string(input[j])
	})
	return input
}
