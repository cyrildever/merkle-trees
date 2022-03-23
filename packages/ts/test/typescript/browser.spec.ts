import { buildHashFunction, Hash, MerkleTree, MerkleTreeOptions, SHA_256, sortHashes } from '../../lib/src/typescript'

describe('buildHashFunction', () => {
  it('should return the right SHA-256 function', async () => {
    const sha256 = buildHashFunction(SHA_256)
    let expected = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
    let found = await sha256(Buffer.from('test'))
    found.toString('hex').should.equal(expected)

    const doubleSha256 = buildHashFunction(SHA_256, true)
    expected = '954d5a49fd70d9b8bcdb35d252267829957f7ef7fa6c74f88419bdc5e82209f4'
    found = await doubleSha256(Buffer.from('test'))
    found.toString('hex').should.equal(expected)
  })
})
describe('MerkleTree', () => {
  describe('fromJSON', () => {
    it('should create the right JSON', () => {
      const empty = '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"tree":{}}'
      const found = MerkleTree.fromJSON(empty)
      found.getEngine().should.equal(SHA_256)
      found.isSorted().should.be.false
      found.useDoubleHash().should.be.false
    })
  })
  describe('toJSON', () => {
    it('should build the appropriate JSON', () => {
      const empty = new MerkleTree()
      const found = empty.toJSON()
      found.should.equal('{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"tree":{}}')
    })
  })
})
describe('MerkleTreeOptions', () => {
  it('should use the default values', () => {
    const found = MerkleTreeOptions()
    found.doubleHash.should.be.false
    found.engine.should.equal(SHA_256)
    found.sort.should.be.false

    const defaultOptions = JSON.stringify(found)
    defaultOptions.should.equal('{"doubleHash":false,"engine":"sha-256","sort":false}')
  })
})
describe('sortHashes', () => {
  it('should sort hashes lexicographically', () => {
    const hashes: ReadonlyArray<Hash> = [
      'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    ].map(_ => Buffer.from(_, 'hex'))
    const expected: ReadonlyArray<Hash> = [
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'
    ].map(_ => Buffer.from(_, 'hex'))

    const found = sortHashes(hashes)
    found.should.eqls(expected)
  })
})
