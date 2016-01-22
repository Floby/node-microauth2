var expect = require('chai').expect;
var jsonwebtoken = require('jsonwebtoken');
var supertest = require('supertest');
var http = require('http');
var Gateway = require('../lib/gateway')

var SECRET = 'test-secret'

describe('gateway server', function () {
  var gateway, target, api;
  beforeEach(function (done) {
    target = new Target();
    target.start(done)
  })
  afterEach(function (done) {
    target.stop(done)
  })

  beforeEach(function (done) {
    gateway = new Gateway({upstream: 'http://localhost:' + target.port, secret: SECRET, port: 0})
    gateway.start(done)
  })
  afterEach(function (done) {
    gateway.stop(done)
  })

  beforeEach(function() {
    api = supertest.bind(null, 'http://localhost:' + gateway.port)
  })

  describe('when calling without a token', function () {
    it('replies 401', function (done) {
      api()
        .get('/hello')
        .expect(401)
        .end(done)
    })
  })

  describe('when calling with an invalid token', function () {
    it('replies 403', function (done) {
      api()
        .get('/hello')
        .set('Authorization', 'Bearer helloworld')
        .expect(403)
        .end(done)
    })
  })


  describe('when calling with a valid token', function () {
    var token = jsonwebtoken.sign({cid: 'hey', scopes: ['scope', 'authorized'], userinfo: {name: 'floby'}}, SECRET)
    it('replies 200', function (done) {
      api()
        .get('/hello')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(done)
    })

    it('forwards to the target', function (done) {
      api()
        .get('/hello')
        .set('Authorization', 'Bearer ' + token)
        .end(function (err) {
          if (err) return done(err)
          expect(target.lastRequest).not.to.be.undefined
          var req = target.lastRequest;
          expect(req.headers).to.have.property('x-clientid')
          expect(req.headers['x-clientid']).to.equal('hey')
          expect(req.headers).to.have.property('x-userinfo')
          expect(req.headers['x-userinfo']).to.equal('eyJuYW1lIjoiZmxvYnkifQ==')
          expect(req.headers).to.have.property('x-scopes')
          expect(req.headers['x-scopes']).to.equal('scope,authorized')
          done()
        })
    })
  })
})

function Target () {
  var target = this;
  var server = http.createServer(function (req, res) {
    target.lastRequest = req
    res.end()
  })

  this.start = function (callback) {
    server.listen(0, function (err) {
      if (err) return callback(err)
      target.port = server.address().port
      callback()
    })
  }

  this.stop = function (callback) {
    server.close(callback)
  }
}