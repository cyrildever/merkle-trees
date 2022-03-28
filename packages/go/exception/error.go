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
