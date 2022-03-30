import {
  buildHashFunction, buildPath, Hashes, isCorrectHash, MerkleProof, merkleProofFrom, MerkleTree, MerkleTreeOptions,
  SHA_256, sortHashes
} from '../../lib/src/typescript'

import chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const expect = chai.expect

const sha256 = buildHashFunction(SHA_256)

describe('Hash', () => {
  describe('buildHashFunction', () => {
    it('should return the right SHA-256 function', async () => {
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
  describe('sortHashes', () => {
    it('should sort hashes lexicographically', () => {
      const hashes: Hashes = [
        'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      ].map(_ => Buffer.from(_, 'hex'))
      const expected: Hashes = [
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'
      ].map(_ => Buffer.from(_, 'hex'))

      const found = sortHashes(hashes)
      found.should.have.lengthOf(3)
      found[0].toString('hex').should.equal('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
      found.should.eqls(expected)
    })
  })
})
describe('MerklePath', () => {
  describe('buildPath', () => {
    it('should return the right path', () => {
      let size = 2
      let expected = '0'
      let found = buildPath(1, size, 1)
      found.should.equal(expected)

      size = 4
      expected = '10'
      found = buildPath(1, size, 2)
      found.should.equal(expected)

      size = 5
      expected = '110'
      found = buildPath(1, size, 3)
      found.should.equal(expected)

      size = 5
      expected = '101'
      found = buildPath(2, size, 3)
      found.should.equal(expected)

      size = 9
      expected = '1110'
      found = buildPath(1, size, 4)
      found.should.equal(expected)

      size = 9
      expected = '0111'
      found = buildPath(8, size, 4)
      found.should.equal(expected)
    })
  })
})
describe('MerkleProof', () => {
  describe('toString', () => {
    it('should print the appropriate proof', () => {
      const hashes = [
        Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'hex'),
        Buffer.from('abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789', 'hex')
      ]
      const proof = MerkleProof(hashes, '101', 5)
      const expected = Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789.101.sha-256.5').toString('base64')

      const found = proof.toString()
      found.should.equal(expected)
    })
  })
  describe('merkleProofFrom', () => {
    it('should rebuild the appropriate Merkle proof', () => {
      const proof = 'MTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZmFiY2RlZjAxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODkuMTAxLnNoYS0yNTYuNQ=='

      const found = merkleProofFrom(proof)
      found.engine.should.equal(SHA_256)
      found.path.should.equal('101')
      found.size.should.equal(5)
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
      /* eslint-disable @typescript-eslint/no-floating-promises */
      const tree = new MerkleTree()
      expect(tree.addLeaves(true)).to.eventually.be.rejectedWith('empty tree')
      expect(tree.addLeaves(false, Buffer.from('123'))).to.eventually.be.rejectedWith('empty tree')
      /* eslint-enable @typescript-eslint/no-floating-promises */
    })
  })
  describe('depth', () => {
    it('should return the correct depth or throw an error', async () => {
      const tree = new MerkleTree()
      expect(() => tree.depth()).to.throw('tree not built')

      const hashes = [
        Buffer.from('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'hex'),
        Buffer.from('abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789', 'hex')
      ]
      await tree.addLeaves(false, ...hashes)
      const found = tree.depth()
      found.should.equal(1)
    })
  })
  describe('getProof', () => {
    it('should be deterministic', async () => {
      const data = ['data1', 'data2', 'data3', 'data4', 'data5']
      const tree = new MerkleTree()
      const maybeProofs = await tree.addLeaves(true, ...data.map(Buffer.from)) // eslint-disable-line @typescript-eslint/unbound-method

      const proof1 = tree.getProof(await sha256(Buffer.from('data1')))
      proof1.isSome().should.be.true
      proof1.some().toString().should.equal(maybeProofs[0].some().toString())

      const proof2 = tree.getProof(await sha256(Buffer.from('data2')))
      proof2.isSome().should.be.true
      proof2.some().path.should.equal('110')
      proof2.some().trail.should.have.lengthOf(3)
      proof2.some().toString().should.equal(maybeProofs[1].some().toString())

      const proof5 = tree.getProof(await sha256(Buffer.from('data5')))
      proof5.isSome().should.be.true
      proof5.some().toString().should.equal(maybeProofs[4].some().toString())

      const tree2 = new MerkleTree()
      await tree2.addLeaves(true, ...data.map(Buffer.from)) // eslint-disable-line @typescript-eslint/unbound-method
      const proof1_2 = tree2.getProof(await sha256(Buffer.from('data1')))
      proof1_2.some().toString().should.equal(proof1.some().toString())
    })
  })
  describe('fromJSON', () => {
    it('should create the right JSON', async () => {
      const empty = '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":[]}'
      expect(MerkleTree.fromJSON(empty)).to.eventually.be.rejectedWith('empty tree') // eslint-disable-line @typescript-eslint/no-floating-promises

      const json = '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}'
      const found = await MerkleTree.fromJSON(json)
      found.getRootHash().should.equal('e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995')
      const proof = found.getProof(Buffer.from('d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c', 'hex'))
      proof.isSome().should.be.true
    })
  })
  describe('toJSON', () => {
    it('should build the appropriate JSON', async () => {
      const empty = new MerkleTree()
      let found = empty.toJSON()
      found.should.equal('{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":[]}')

      const data = ['data1', 'data2', 'data3', 'data4', 'data5']
      const tree = new MerkleTree()
      await tree.addLeaves(true, ...data.map(Buffer.from)) // eslint-disable-line @typescript-eslint/unbound-method
      const expected = '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}'
      found = tree.toJSON()
      found.should.equal(expected)
    })
  })
  describe('validateProof', () => {
    const toProve = merkleProofFrom('ZTE5NWRhNGM0MGYyNmI4NWViMmI2MjJlMWMwZDFjZTczZDRkOGJmNDE4M2NkODA4ZDM5YTU3ZTg1NTA5MzQ0NmFhNzVjZDVlMjUzMWYwNzJjNzAwN2JiMTkxZmViZGNkYmUyM2Q5YTRhZTMwY2RiYjg0Y2I1YTg2OWNlOWFiODM1YjQxMzYyYmM4MmI3ZjNkNTZlZGM1YTMwNmRiMjIxMDU3MDdkMDFmZjQ4MTllMjZmYWVmOTcyNGEyZDQwNmM5LjExMC5zaGEtMjU2LjU=')
    const json = '{"options":{"doubleHash":false,"engine":"sha-256","sort":false},"leaves":["5b41362bc82b7f3d56edc5a306db22105707d01ff4819e26faef9724a2d406c9","d98cf53e0c8b77c14a96358d5b69584225b4bb9026423cbc2f7b0161894c402c","f60f2d65da046fcaaf8a10bd96b5630104b629e111aff46ce89792e1caa11b18","02c6edc2ad3e1f2f9a9c8fea18c0702c4d2d753440315037bc7f84ea4bba2542","e195da4c40f26b85eb2b622e1c0d1ce73d4d8bf4183cd808d39a57e855093446"]}'

    it('should accept a valid proof', async () => {
      const tree = await MerkleTree.fromJSON(json)
      tree.size().should.equal(toProve.size) // It's supposed to be tested somehow, even though it's not part of the proof per se
      const found = await tree.validateProof(toProve, await sha256(Buffer.from('data2')), 'e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995')
      found.should.be.true
    })
    it('should refuse an invalid data', async () => {
      const tree = await MerkleTree.fromJSON(json)
      const found = await tree.validateProof(toProve, await sha256(Buffer.from('data6')), 'e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995')
      found.should.be.false
    })
    it('should refuse an invalid proof even for an existing data', async () => {
      const tree = await MerkleTree.fromJSON(json)
      const found = await tree.validateProof(toProve, await sha256(Buffer.from('data1')), 'e9e1bc4a10c502ef995ede1914b0186ed288b8dde80c8c533a0f93a96490f995')
      found.should.be.false
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
