var jsonwebtoken = require('jsonwebtoken')
var sinon = require('sinon')
require('chai').use(require('sinon-chai'))
var expect = require('chai').expect
var mockHttp = require('node-mocks-http')
var Middleware = require('../middleware')
var Client = require('../lib/client')

var SECRET = 'test-secret'

describe('microauth2(req, res, next)', function () {
  var middleware = Middleware({secret: SECRET})

  describe('with no Authorization header', function () {
    it('sends a 401', function () {
      var req = mockHttp.createRequest({
        method: 'GET',
        url: '/'
      })

      var res = mockHttp.createResponse()

      middleware(req, res, sinon.spy())

      expect(res.statusCode).to.equal(401)
      expect(res._isEndCalled()).to.be.true
    })
  })

  describe('with an invalid Bearer token', function () {
    it('sends a 401', function () {
      var req = mockHttp.createRequest({
        method: 'GET',
        url: '/',
        headers: {
          Authorization: 'Bearer coucou'
        }
      })

      var res = mockHttp.createResponse()

      middleware(req, res, sinon.spy())

      expect(res.statusCode).to.equal(401)
      expect(res._isEndCalled()).to.be.true
    })
  })

  describe('with a valid Bearer token', function () {
    var token = jsonwebtoken.sign({cid: 'my-client'}, SECRET)
    it('calls next', function () {
      var req = mockHttp.createRequest({
        method: 'GET',
        url: '/',
        headers: {
          Authorization: 'Bearer ' + token
        }
      })

      var res = mockHttp.createResponse()
      var next = sinon.spy()

      middleware(req, res, next)

      expect(next.calledWith()).to.be.true
      expect(res._isEndCalled()).to.be.false
    })

    it('adds the client object as req.microauth2', function () {
      var req = mockHttp.createRequest({
        method: 'GET',
        url: '/',
        headers: {
          Authorization: 'Bearer ' + token
        }
      })

      var res = mockHttp.createResponse()
      var next = sinon.spy()

      middleware(req, res, next)

      expect(req.microauth2).to.be.an.instanceof(Client)
      expect(req.microauth2.getClientId()).to.equal('my-client')
    })
  })
})

describe('microauth2.needs(scope)', function () {
  var res, next, req
  var needs = Middleware.needs('scope')
  beforeEach(function () {
    next = sinon.spy()
    res = mockHttp.createResponse()
    req = mockHttp.createRequest({
      method: 'GET',
      url: '/'
    })

  })
  describe('when no microauth2 client is present', function () {
    it('calls next with an error', function () {
      needs(req, res, next)
      expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error))
    })
  })

  describe('when there is a client with matching scope', function () {
    it('calls next', function () {
      req.microauth2 = new Client({scope: ['scope']})
      needs(req, res, next)
      expect(next).to.have.been.calledWithExactly()
    })
  })

  describe('when there is a client with no matching scope', function () {
    it('returns a 403', function () {
      req.microauth2 = new Client({scope: ['something']})
      needs(req, res, next)
      expect(res.statusCode).to.equal(403)
      expect(res._isEndCalled()).to.be.true
      expect(next).not.to.have.been.called
    })
  })
})
