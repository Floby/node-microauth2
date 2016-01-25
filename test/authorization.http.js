var expect = require('chai').expect;
var jsonwebtoken = require('jsonwebtoken');
var supertest = require('supertest');
var http = require('http');
var Authorization = require('../lib/authorization')
var AccessToken = require('../lib/access-token')
var sinon = require('sinon');

var SECRET = 'test-secret'

describe('authorization server', function () {
  var authorization, api, AccessTokenMock;

  beforeEach(function (done) {
    authorization = new Authorization({secret: SECRET, port: 0})
    authorization.start(done)
  })
  afterEach(function (done) {
    authorization.stop(done)
  })

  beforeEach(function() {
    api = supertest.bind(null, 'http://localhost:' + authorization.port)
  })

  describe('POST /token', function () {
    describe('with no grant_type', function() {
      it('replies 400', function (done) {
        api()
          .post('/token')
          .send({})
          .expect(400)
          .end(done)
      })
    })

    describe('with grant_type=client_credentials', function () {
      describe('with no credentials', function () {
        it('replies 400', function (done) {
          api()
            .post('/token')
            .send({grant_type: 'client_credentials'})
            .expect(400)
            .end(done)
        })
      })

      describe('with a valid request', function () {
        var credentials = {
          grant_type: 'client_credentials',
          client_id: 'my-id',
          client_secret: 'my-secret',
          scopes: ['hey']
        }
        beforeEach(function () {
          AccessTokenMock = sinon.mock(AccessToken)
          AccessTokenMock.expects('generate').withArgs(credentials).returns({hello: 'goodbye'})
        })
        afterEach(function () {
          AccessTokenMock.restore()
        })
        it('replies 200', function (done) {
          api()
            .post('/token')
            .send(credentials)
            .expect(200)
            .end(done)
        })

        it('replies with an access token', function (done) {
          api()
            .post('/token')
            .send(credentials)
            .expect('content-type', /application\/json/i)
            .end(function (err, res) {
              if (err) return done(err)
              var body = res.body
              expect(body).to.have.property('access_token')
              expect(body.access_token).to.be.a('string')
              expect(body.expires_in).to.be.a('number')
              done()
            })
        })

        describe('the access_token', function () {
          var accessToken;
          beforeEach(function (done) {
            api()
              .post('/token')
              .send(credentials)
              .end(function (err, res) {
                if (err) return done(err)
                accessToken = res.body.access_token
                done()
              })
          })
          it('is a valid JWT', function () {
            var token = jsonwebtoken.verify(accessToken, SECRET)
            delete token.iat; //ignore auto value for our comparison
            delete token.exp; //ignore auto value for our comparison
            expect(token).to.deep.equal({hello: 'goodbye'})
          })
        })
      })
    })
  })
})
