var mockHttp = require('node-mocks-http');
var expect = require('chai').expect
var sinon = require('sinon');

var Authorization = require('../lib/authorization')

describe('Authorization', function () {
  describe('.sanitizeRequest(req, res, next)', function () {
    var req, res, next;
    var sanitizeRequest = Authorization.sanitizeRequest
    beforeEach(() => {
      req = mockHttp.createRequest({
        method: 'POST',
        url: '/token',
        body: {}
      })
      res = mockHttp.createResponse()
      next = sinon.spy()
    })
    it('calls next', function () {
      sanitizeRequest(req, res, next)
      expect(next).to.have.been.calledWithExactly()
    })

    describe('with BasicAuth', function () {
      it('populates the payload with client_id and client_secret', function () {
        req.headers['authorization'] = 'Basic ' + new Buffer('hello:world').toString('base64')
        sanitizeRequest(req, res, next)
        expect(req.body).to.have.property('client_id')
        expect(req.body.client_id).to.equal('hello')
        expect(req.body).to.have.property('client_secret')
        expect(req.body.client_secret).to.equal('world')
      })
    })

    describe('with scope as array', function () {
      it('leaves it as an array', function () {
        req.body.scope = ['A']
        sanitizeRequest(req, res, next)
        expect(req.body.scope).to.deep.equal(['A'])
      })
    })
    describe('with scope as single string', function () {
      it('casts it to an array', function () {
        req.body.scope = 'A'
        sanitizeRequest(req, res, next)
        expect(req.body.scope).to.deep.equal(['A'])
      })
    })

    describe('with scope as comma-separated string', function () {
      it('casts it to an array', function () {
        req.body.scope = 'A,B,C'
        sanitizeRequest(req, res, next)
        expect(req.body.scope).to.deep.equal(['A', 'B', 'C'])
      })
    })

    describe('with scope as blank-separated string', function () {
      it('casts it to an array', function () {
        req.body.scope = 'A B\t C'
        sanitizeRequest(req, res, next)
        expect(req.body.scope).to.deep.equal(['A', 'B', 'C'])
      })
    })
  })
})
