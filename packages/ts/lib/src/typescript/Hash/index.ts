import { createHash } from 'crypto'

import { InvalidEngineError } from '../Error'

export type Hash = Buffer

export type HashFunction = (item: Buffer) => Promise<Hash>

// IE 11
declare global {
  interface Window {
    msCrypto?: Crypto
  }
  interface Crypto {
    webkitSubtle?: SubtleCrypto
  }
}

let subtle: SubtleCrypto
if (typeof window !== 'undefined') {
  /* eslint-disable @typescript-eslint/strict-boolean-expressions */
  const crypto = window.crypto || window.msCrypto! // eslint-disable-line @typescript-eslint/no-non-null-assertion
  subtle = (crypto.subtle || crypto.webkitSubtle)! // eslint-disable-line @typescript-eslint/no-non-null-assertion
  /* eslint-enable @typescript-eslint/strict-boolean-expressions */
}

export const buildHashFunction = (engine: string, doubleHash = false): HashFunction => {
  switch (engine) {
    case SHA_256:
      /* eslint-disable @typescript-eslint/unbound-method */
      return subtle === undefined
        ? (item: Buffer) => Promise.resolve(doubleHash
          ? createHash('sha256').update(createHash('sha256').update(item).digest()).digest()
          : createHash('sha256').update(item).digest()
        )
        : (item: Buffer) => subtle.digest({ name: 'SHA-256' }, item).then(Buffer.from)
          .then(result => doubleHash
            ? subtle.digest({ name: 'SHA-256' }, result).then(Buffer.from)
            : result)
    /* eslint-enable @typescript-eslint/unbound-method */
    default:
      throw new InvalidEngineError(engine)
  }
}

// Supported hash functions
export const SHA_256 = 'sha-256'

/**
 * Lexicographically sort the hexadecimal representation of the passed hashes
 * 
 * @param {Hash[]} input - The array of hashes to sort 
 * @returns a sorted array of hashes
 */
export const sortHashes = (input: ReadonlyArray<Hash>): ReadonlyArray<Hash> =>
  input.map(_ => _.toString('hex')).sort((a: string, b: string) => a > b ? 1 : -1).map(_ => Buffer.from(_, 'hex'))
