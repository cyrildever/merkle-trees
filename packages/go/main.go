package main

import (
	"fmt"

	"github.com/cyrildever/go-utls/common/logger"
)

// Usage
//
// Build:
// - `go build -o merkle-tree && ./merkle-tree`
func main() {
	log := logger.Init("main", "main")

	// Just to make sure everything is ok
	// TODO

	// Print special information for library users
	fmt.Println("")
	fmt.Println("COPYRIGHT NOTICE")
	fmt.Println("================")
	fmt.Println("This is my implementation of Merkle tree for Go. It's available under a MIT license.")
	fmt.Println("")
	fmt.Println("© 2022 Cyril Dever. All rights reserved.")
	fmt.Println("")

	log.Info("Enjoy~")
}
