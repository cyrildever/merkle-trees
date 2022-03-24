import {
  buildHashFunction, Hash, isCorrectHash, MerkleProof, merkleProofFrom, MerkleTree, MerkleTreeOptions, SHA_256, sortHashes
} from '../../lib/src/typescript'

import chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const expect = chai.expect

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
describe('isCorrectHash', () => {
  it('should know whether it is a correct hash', () => {
    const correct = Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'hex')
    let found = isCorrectHash(correct, SHA_256)
    found.should.be.true

    const incorrect = Buffer.from('incorrect')
    found = isCorrectHash(incorrect, SHA_256)
    found.should.be.false

    found = isCorrectHash(correct, 'wrong-engine')
    found.should.be.false
  })
})
describe('MerkleProof', () => {
  describe('toString', () => {
    it('should print the appropriate proof', () => {
      const hashes = [
        Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'hex'),
        Buffer.from('abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789', 'hex')
      ]
      const proof = MerkleProof(hashes)
      const expected = Buffer.from('sha-256.1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789').toString('base64')

      const found = proof.toString()
      found.should.equal(expected)
    })
  })
  describe('merkleProofFrom', () => {
    it('should rebuild the appropriate Merkle proof', () => {
      const proof = 'c2hhLTI1Ni4xMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmYWJjZGVmMDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEyMzQ1Njc4OQ=='

      const found = merkleProofFrom(proof)
      found.engine.should.equal(SHA_256)
      found.trail.should.have.lengthOf(2)
      found.trail[0].should.eqls(Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'hex'))
      found.trail[1].should.eqls(Buffer.from('abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789', 'hex'))
      found.toString().should.equal(proof)

      expect(() => merkleProofFrom('not-a-valid-proof')).to.throw('invalid proof: not-a-valid-proof')
    })
  })
})
describe('MerkleTree', () => {
  describe('addLeaves', () => {
    it('should fail if the tree remains empty', () => {
      const tree = new MerkleTree()
      expect(tree.addLeaves(false, Buffer.from('123'))).to.eventually.be.rejectedWith('empty tree') // eslint-disable-line @typescript-eslint/no-floating-promises
    })
  })
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
