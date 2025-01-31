package main

import (
	"fmt"

	"github.com/cyrildever/go-utls/common/logger"
	utls "github.com/cyrildever/go-utls/common/utils"
	"github.com/cyrildever/merkle-trees/packages/go/model/hash"
)

// Usage
//
// Build:
// - `go build -o merkle-tree && go test ./... && ./merkle-tree`
func main() {
	log := logger.Init("main", "main")

	// TODO Add proof validation features

	// Just to make sure everything is ok
	if isCorrect := hash.IsCorrect(utls.Must(utls.FromHex("1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")), hash.SHA_256); !isCorrect {
		log.Crit("Weird error")
		return
	}

	// Print special information for library users
	fmt.Println("")
	fmt.Println("COPYRIGHT NOTICE")
	fmt.Println("================")
	fmt.Println("This is my implementation of Merkle tree for Go. It's available under a MIT license.")
	fmt.Println("")
	fmt.Println("© 2022-2025 Cyril Dever. All rights reserved.")
	fmt.Println("")

	log.Info("Enjoy~")
}
