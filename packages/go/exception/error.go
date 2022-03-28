package exception

import (
	"fmt"
)

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
