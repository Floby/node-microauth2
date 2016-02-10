var jsonwebtoken = require('jsonwebtoken')
var jsdom = require('js-dom').jsdom
var expect = require('chai').expect
var supertest = require('supertest')
var Authorization = require('../lib/authorization')
var config = require('../lib/authorization/config')
var sinon = require('sinon')
var querystring = require('querystring')
var AccessToken = require('../lib/authorization/access-token')
var SignedToken = require('../lib/authorization/signed-token')

var SECRET = 'test-secret'
var client_id = 'my-id'
var STATE_SECRET = `${client_id}:${SECRET}`

describe('authorization server', function () {
  var authorization, api
  var client = {
    id: client_id,
    scope: ['A', 'B', 'C'],
    callback_implicit: 'https://my.client.com/app'
  }

  beforeEach(function (done) {
    sinon.stub(config, 'get')
      .withArgs('secret').returns(SECRET)
      .withArgs('clients').returns([client])
    authorization = new Authorization({port: 0})
    authorization.start(done)
  })
  afterEach(function (done) {
    authorization.stop(done)
    config.get.restore()
  })

  beforeEach(function() {
    api = supertest.bind(null, 'http://localhost:' + authorization.port)
  })

  describe('GET /authorize?client_id&scope', function () {
    describe('with valid client id and scopes', function () {
      it('replies 200', function (done) {
        api()
          .get('/authorize')
          .query({client_id, scope: 'A B'})
          .expect(200)
          .expect('Content-Type', /text\/x?html/)
          .end(done)
      })

      it('replies with a login form', function (done) {
        api()
          .get('/authorize')
          .query({client_id, scope: 'A B'})
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            var document = jsdom(res.text)
            var form = document.querySelector('form#authorization-form')
            expect(form).not.to.be.null
            done()
          })
      })

      describe('the login form', function () {
        var form
        beforeEach(function (done) {
          api()
            .get('/authorize')
            .query({client_id, scope: 'A B'})
            .end(function (err, res) {
              if (err) return done(err)
              var document = jsdom(res.text)
              form = document.querySelector('form#authorization-form')
              done()
            })
        })

        it('has an input "email"', function () {
          var emailInput = form.querySelector('input[name=email]')
          expect(emailInput).not.to.be.null
          expect(emailInput.type).to.equal('email')
        })
        it('has an input "password"', function () {
          var passwordInput = form.querySelector('input[name=password]')
          expect(passwordInput).not.to.be.null
          expect(passwordInput.type).to.equal('password')
        })
        it('has an input "state"', function () {
          var stateInput = form.querySelector('input[name=state]')
          expect(stateInput).not.to.be.null
          expect(stateInput.type).to.equal('hidden')
        })
        it('has an input "client_id"', function () {
          var clientIdInput = form.querySelector('input[name=client_id]')
          expect(clientIdInput).not.to.be.null
          expect(clientIdInput.type).to.equal('hidden')
          expect(clientIdInput.value).to.equal(client_id)
        })
        describe('the input state', function () {
          var stateInput
          beforeEach(() => stateInput = form.querySelector('input[name=state]'))
          it('has a value', function () {
            expect(stateInput).to.have.property('value')
            expect(stateInput.value).to.be.ok
          })
          it('holds a signed JWT', function () {
            jsonwebtoken.verify(stateInput.value, STATE_SECRET)
          })
        })
      })
    })
  })

  describe('POST /authorize', function () {
    var credentials = {
      client_id: client_id,
      email: 'bob@service.com',
      password: 'password'
    }
    var endpoint = function () {
      return api()
        .post('/authorize')
        .query({client_id})
        .set('Content-Type', 'application/x-www-form-urlencoded')
    }
    describe('with no state field', function() {
      it('replies 400', function (done) {
        endpoint()
          .send({email: 'hey', password: 'hey'})
          .expect(400)
          .end(done)
      })
    })

    describe('with a valid state', function () {
      var state = jsonwebtoken.sign({client_id, scope: ['A', 'C']}, STATE_SECRET)
      var AccessTokenMock
      beforeEach(function () {
        AccessTokenMock = sinon.mock(AccessToken)
      })
      afterEach(function () {
        AccessTokenMock.restore()
      })
      describe('and valid credentials', function () {
        var expectedToken = new SignedToken({something: 'sweet'}, SECRET)
        beforeEach(function () {
          AccessTokenMock
            .expects('generate')
            .withArgs({
              client_id: 'my-id',
              grant_type: 'implicit',
              email: 'bob@service.com',
              password: 'password',
              scope: ['A', 'C']
            })
            .returns(expectedToken)
        })
        it('replies with 301', function (done) {
          endpoint()
            .send(Object.assign({state}, credentials))
            .expect(301)
            .end(done)
        })
        it('redirects to the endpoint of the client', function (done) {
          endpoint()
            .send(Object.assign({state}, credentials))
            .end(function (err, res) {
              if (err) return done(err)
              expect(res.headers).to.have.property('location')
              var location = res.headers.location
              expect(location).to.contain('#')
              var split = location.split('#')
              var uri = split[0]
              var data = querystring.decode(split[1])
              expect(uri).to.equal('https://my.client.com/app')
              expect(data).to.have.property('access_token')
              expect(data.access_token).to.equal(expectedToken.toJSON())
              AccessTokenMock.verify()
              done()
            })
        })
      })
    })

    describe('with invalid state', function () {
      var state = 'some state'
      describe('and valid credentials', function () {
        it('replies with 400', function (done) {
          endpoint()
            .send(Object.assign({state}, credentials))
            .expect(400)
            .end(done)
        })
      })
    })
  })
})
