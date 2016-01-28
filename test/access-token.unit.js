var jsonwebtoken = require('jsonwebtoken')
var expect = require('chai').expect
var AccessToken = require('../lib/access-token')
var Clients = require('../lib/clients')
var Scopes = require('../lib/scopes')
var ClientsMock
var config = require('../lib/authorization-config')
var sinon = require('sinon')
var times = require('../lib/times')

var SECRET = 'test-secret'
describe('AccessToken', function () {
  var client = {id: 'my-id', secret: 'my-secret', scope: ['A', 'B']}
  beforeEach(() => ClientsMock = sinon.mock(Clients) )
  afterEach(() => ClientsMock.restore())
  beforeEach(() => sinon.stub(config, 'get').withArgs('secret').returns(SECRET))
  afterEach(() => config.get.restore())

  describe('.generate(credentials)', function () {
    describe('with no credentials', function () {
      it('throws', function () {
        expect(() => AccessToken.generate()).to.throw(Error)
      })
    })
    describe('with client_credentials', function () {
      describe('when the client_id and client_secret match', function () {
        var actual
        var credentials = {
          grant_type: 'client_credentials',
          client_id: 'my-id',
          client_secret: 'my-secret',
          scope: ['A']
        }
        beforeEach(function () {
          ClientsMock.expects('challengeCredentials').withArgs('my-id', 'my-secret').returns(client)
          sinon.stub(Scopes, 'match').withArgs(['A'], ['A', 'B']).returns(['stubbed_scope_match'])
          actual = AccessToken.generate(credentials)
        })
        afterEach(function () {
          ClientsMock.verify()
          Scopes.match.restore()
        })

        it('returns an object', function () {
          expect(actual).to.be.an('object')
        })

        it('has queried scope', function () {
          expect(actual).to.have.property('scope')
          expect(actual.scope).to.deep.equal(['stubbed_scope_match'])
          expect(Scopes.match).to.have.been.calledWith(['A'], ['A', 'B'])
        })

        it('has client id', function () {
          expect(actual).to.have.property('cid')
          expect(actual.cid).to.equal('my-id')
        })

        describe('.toJSON()', function () {
          it('returns a signed token', function () {
            var token = actual.toJSON()
            expect(token).to.be.a('string')
            expect(token).to.equal(jsonwebtoken.sign(actual, SECRET, {expiresIn: times.accessTokenDuration}))
          })
        })
      })

      describe('when the client_id and client_secret do not match', function () {
        var credentials = {
          grant_type: 'client_credentials',
          client_id: 'my-id',
          client_secret: 'other'
        }
        it('throws', function () {
          var client = {id: 'my-id', secret: 'my-secret'}
          ClientsMock.expects('challengeCredentials').withArgs('my-id', 'other').throws(Error('invalid client credentials'))
          expect(() => AccessToken.generate(credentials)).to.throw(/invalid client credentials/i)
          ClientsMock.verify()
        })
      })
    })
  })
})
