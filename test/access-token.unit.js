var expect = require('chai').expect
var AccessToken = require('../lib/access-token')
var Clients = require('../lib/clients')
var Scopes = require('../lib/scopes')
var ClientsMock;
var sinon = require('sinon');

describe('AccessToken', function () {
  beforeEach(() => ClientsMock = sinon.mock(Clients) )
  afterEach(() => ClientsMock.restore())

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
        var client = {id: 'my-id', secret: 'my-secret', scope: ['A', 'B']}
        beforeEach(function () {
          ClientsMock.expects('getById').withArgs('my-id').returns(client)
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
      })

      describe('when the client_id and client_secret do not match', function () {
        var credentials = {
          grant_type: 'client_credentials',
          client_id: 'my-id',
          client_secret: 'other'
        }
        it('throws', function () {
          var client = {id: 'my-id', secret: 'my-secret'}
          ClientsMock.expects('getById').withArgs('my-id').returns(client)
          expect(() => AccessToken.generate(credentials)).to.throw(Error)
          ClientsMock.verify()
        })
      })
    })
  })
})
