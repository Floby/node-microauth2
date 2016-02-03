var expect = require('chai').expect
var AccessToken = require('../lib/authorization/access-token')
var Clients = require('../lib/authorization/clients')
var Users = require('../lib/authorization/users')
var Scopes = require('../lib/authorization/scopes')
var config = require('../lib/authorization/config')
var sinon = require('sinon')
var times = require('../lib/authorization/times')
var SignedToken = require('../lib/authorization/signed-token')

var SECRET = 'test-secret'
var ClientsMock, UsersMock, SignedTokenMock
describe('AccessToken', function () {
  var client = {id: 'my-id', secret: 'my-secret', scope: ['A', 'B']}
  var bob = {email: 'bob@service.com'}
  beforeEach(() => ClientsMock = sinon.mock(Clients) )
  afterEach(() => ClientsMock.restore())
  beforeEach(() => UsersMock = sinon.mock(Users) )
  afterEach(() => UsersMock.restore())
  beforeEach(() => SignedTokenMock = sinon.mock(SignedToken) )
  afterEach(() => SignedTokenMock.restore())
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
        var expectedPayload = {
          scope: ['stubbed_scope_match'],
          cid: 'my-id'
        }
        var expiryRule = {
          expiresIn: times.accessTokenDuration
        }
        beforeEach(function () {
          UsersMock.expects('challengeCredentials').never()
          ClientsMock.expects('challengeCredentials').withArgs('my-id', 'my-secret').returns(client)
          SignedTokenMock.expects('create').withArgs(expectedPayload, SECRET, expiryRule).returns(expectedPayload)
          sinon.stub(Scopes, 'match').withArgs(['A'], ['A', 'B']).returns(['stubbed_scope_match'])
          actual = AccessToken.generate(credentials)
        })
        afterEach(function () {
          Scopes.match.restore()
        })

        it('challenges the client credentials', function () {
          ClientsMock.verify()
        })

        it('returns the signed token with expected data', function () {
          expect(actual).to.equal(expectedPayload)
          SignedTokenMock.verify()
        })

        it('does not challenge user credentials', function () {
          UsersMock.verify()
        })
      })

      describe('when the client_id and client_secret do not match', function () {
        var credentials = {
          grant_type: 'client_credentials',
          client_id: 'my-id',
          client_secret: 'other'
        }
        it('throws', function () {
          ClientsMock.expects('challengeCredentials').withArgs('my-id', 'other').throws(Error('invalid client credentials'))
          expect(() => AccessToken.generate(credentials)).to.throw(/invalid client credentials/i)
          ClientsMock.verify()
        })
      })
    })

    describe('with "password" credentials', function () {
      var actual
      var credentials = {
        grant_type: 'password',
        client_id: 'my-id',
        client_secret: 'my-secret',
        email: 'bob@service.com',
        password: 'password',
        scope: ['A']
      }
      var expectedPayload = {
        scope: ['stubbed_scope_match'],
        cid: 'my-id',
        userinfo: {email: 'bob@service.com'}
      }
      var expiryRule = {
        expiresIn: times.accessTokenDuration
      }
      beforeEach(function () {
        ClientsMock.expects('challengeCredentials').withArgs('my-id', 'my-secret').returns(client)
        UsersMock.expects('challengeCredentials').withArgs('bob@service.com', 'password').returns(bob)
        SignedTokenMock.expects('create').withArgs(expectedPayload, SECRET, expiryRule).returns(expectedPayload)
        sinon.stub(Scopes, 'match').withArgs(['A'], ['A', 'B']).returns(['stubbed_scope_match'])
        actual = AccessToken.generate(credentials)
      })
      afterEach(function () {
        Scopes.match.restore()
      })

      it('challenges the client credentials', function () {
        ClientsMock.verify()
      })

      it('challenges the user credentials', function () {
        UsersMock.verify()
      })

      it('returns the signed token with expected data', function () {
        expect(actual).to.equal(expectedPayload)
        SignedTokenMock.verify()
      })
    })
  })
})
