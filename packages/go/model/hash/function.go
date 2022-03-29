package hash

import (
	"crypto/sha256"
	"regexp"

	"github.com/cyrildever/merkle-trees/packages/go/exception"
)

// Function
type Function func([]byte) Hash

// Supported hash functions
const (
	SHA_256 = "sha-256"
)

var (
	regexSha256 = regexp.MustCompile(`^[a-f0-9]{64}$`)
)

// BuildFunction ...
func BuildFunction(engine string, doubleHash ...bool) (fn Function, err error) {
	doDoubleHash := false
	if len(doubleHash) == 1 && doubleHash[0] {
		doDoubleHash = true
	}
	switch engine {
	case SHA_256:
		return func(item []byte) Hash {
			h := sha256.New()
			_, _ = h.Write(item)
			if doDoubleHash {
				h2 := sha256.New()
				_, _ = h2.Write(h.Sum(nil))
				return h2.Sum(nil)
			} else {
				return h.Sum(nil)
			}
		}, nil
	default:
		err = exception.NewInvalidEngineError(engine)
	}
	return
}
