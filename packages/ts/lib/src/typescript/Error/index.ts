export class ImpossibleToSortError extends Error {
  constructor(msg = 'impossible to sort') {
    super(msg)
    Object.setPrototypeOf(this, ImpossibleToSortError.prototype)
  }
}

export class InvalidEngineError extends Error {
  constructor(msg: string) {
    super(`invalid engine: ${msg}`)
    Object.setPrototypeOf(this, InvalidEngineError.prototype)
  }
}

export class InvalidJSONError extends Error {
  constructor(msg: string) {
    super(msg)
    Object.setPrototypeOf(this, InvalidJSONError.prototype)
  }
}

export class InvalidMerkleProofError extends Error {
  constructor(msg: string) {
    super(`invalid proof: ${msg}`)
    Object.setPrototypeOf(this, InvalidMerkleProofError.prototype)
  }
}

export class TreeNotBuiltError extends Error {
  constructor(msg = 'tree not built') {
    super(msg)
    Object.setPrototypeOf(this, TreeNotBuiltError.prototype)
  }
}

export class UnableToBuildPathError extends Error {
  constructor(msg: string) {
    super(`unable to build path, found: ${msg}`)
    Object.setPrototypeOf(this, UnableToBuildPathError.prototype)
  }
}
