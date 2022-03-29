package merkle

import (
	"encoding/base64"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	utls "github.com/cyrildever/go-utls/common/utils"
	"github.com/cyrildever/merkle-trees/packages/go/exception"
	"github.com/cyrildever/merkle-trees/packages/go/model/hash"
)

// Proof defines the Merkle tree proof that consists of the trail of intermediate hashes suffixed with the path,
// the name of the hashing engine used and the size of the Merkle tree at the date of the proof.
type Proof struct {
	Trail hash.Hashes
	Path
	Size   int
	Engine string
}

// String returns the base64-encoded dot-separated concatenation of the hexadecimal hashes, the path, the engine and the size of the tree, eg.
//
//       (rootHash)
//          /  \
//         ()   hash2
//        /  \
//   (leaf)  hash1
//
//	=> proofStr := Base64Encode("<hash1><hash2>.11.sha-256.4")
func (p *Proof) String() string {
	var hashes []string
	for _, h := range p.Trail {
		hashes = append(hashes, utls.ToHex(h))
	}
	return base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s.%s.%s.%d", strings.Join(hashes, ""), p.Path, p.Engine, p.Size)))
}

// NewProof ...
func NewProof(trail hash.Hashes, path Path, size int, engine ...string) *Proof {
	usingEngine := hash.SHA_256
	if len(engine) == 1 && engine[0] != "" { // TODO Add engine validity check?
		usingEngine = engine[0]
	}
	return &Proof{
		Trail:  trail,
		Path:   path,
		Size:   size,
		Engine: usingEngine,
	}
}

// ProofFrom builds a `MerkleProof` from the passed string, provided it's an actual stringified proof
func ProofFrom(b64 string) (p *Proof, err error) {
	str, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		err = exception.NewInvalidMerkleProofError(b64)
		return
	}
	parts := strings.Split(string(str), ".")
	if len(parts) != 4 {
		err = exception.NewInvalidMerkleProofError(b64)
		return
	}
	var path Path = parts[1]
	engine := parts[2]
	size, err := strconv.Atoi(parts[3])
	if size == 0 || err != nil {
		if err == nil {
			err = exception.NewInvalidMerkleProofError(b64)
		}
		return
	}
	switch engine {
	case hash.SHA_256:
		hashes := regexp.MustCompile("(.{64})").FindAllString(parts[0], -1)
		if hashes == nil {
			err = exception.NewInvalidMerkleProofError(b64)
			return
		}
		var trail hash.Hashes
		for _, h := range hashes {
			bytes, e := utls.FromHex(h)
			if e != nil {
				err = exception.NewInvalidMerkleProofError(b64)
				return
			}
			trail = append(trail, bytes)
		}
		p = NewProof(trail, path, size, engine)
	default:
		err = exception.NewInvalidMerkleProofError(b64)
	}
	return
}
