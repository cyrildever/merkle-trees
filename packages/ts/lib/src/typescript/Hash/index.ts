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

const regexSha256 = new RegExp(/^[a-f0-9]{64}$/gi)

/**
 * Determine if it's a hash
 * 
 * @param {Buffer} h - The hash to test
 * @param {string} engine - the hashing function name, eg. `'sha-256'`
 * @returns `true` if the passed hash is possibly a rightful hash
 */
export const isCorrectHash = (h: Buffer, engine: string): boolean => {
  switch (engine) {
    case SHA_256:
      return regexSha256.test(h.toString('hex'))
    default:
      return false
  }
}

/**
 * Lexicographically sort the hexadecimal representation of the passed hashes
 * 
 * @param {Hash[]} input - The array of hashes to sort 
 * @returns a sorted array of hashes
 */
export const sortHashes = (input: ReadonlyArray<Hash>): ReadonlyArray<Hash> =>
  input.concat().sort(Buffer.compare) // eslint-disable-line @typescript-eslint/unbound-method
