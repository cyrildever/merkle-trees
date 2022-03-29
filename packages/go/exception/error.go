package exception

import (
	"fmt"
)

// InvalidEngineError ...
type InvalidEngineError struct {
	message string
}

func (e InvalidEngineError) Error() string {
	return e.message
}
func NewInvalidEngineError(msg string) *InvalidEngineError {
	return &InvalidEngineError{
		message: fmt.Sprintf("invalid engine: %s", msg),
	}
}

// InvalidMerkleProofError ...
type InvalidMerkleProofError struct {
	message string
}

func (e InvalidMerkleProofError) Error() string {
	return e.message
}
func NewInvalidMerkleProofError(msg string) *InvalidMerkleProofError {
	return &InvalidMerkleProofError{
		message: fmt.Sprintf("invalid proof: %s", msg),
	}
}

// UnableToBuildPathError ...
type UnableToBuildPathError struct {
	message string
}

func (e UnableToBuildPathError) Error() string {
	return e.message
}
func NewUnableToBuildPathError(msg string) *UnableToBuildPathError {
	return &UnableToBuildPathError{
		message: fmt.Sprintf("unable to build path, found: %s", msg),
	}
}
