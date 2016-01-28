var Authorization = require('../lib/authorization')
var Gateway = require('../lib/gateway')
var supertest = require('supertest')
var Server = require('../lib/server')
var express = require('express')
var config = require('../lib/authorization-config')

var SECRET = 'test-secret'
describe('Resource Owner Credentials flow', function () {
  var authorization, gateway, target
  var api = supertest.bind(null, 'http://localhost:9181')
  var auth = supertest.bind(null, 'http://localhost:9182')
  before(() => {
    config.defaults({
      clients: [{
        id: 'client-id',
        secret: 'client-secret',
        scope: ['A', 'B', 'C']
      }],
      users: [{
        email: 'bob@service.com',
        password_sha256: 'XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg='
      }],
      secret: SECRET
    })
  })

  before(function () {
    target = new Target(9180)
    gateway = new Gateway({port: 9181, upstream: 'http://localhost:9180', secret: SECRET})
    authorization = new Authorization({port: 9182})
  })

  before(done => target.start(done))
  before(done => gateway.start(done))
  before(done => authorization.start(done))

  it('obtains an access token and makes an API call', function (done) {
    auth()
      .post('/token')
      .set('Authorization', 'Basic ' + new Buffer('client-id:client-secret').toString('base64'))
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        grant_type: 'password',
        scope: 'A C',
        email: 'bob@service.com',
        password: 'password'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/i)
      .end((err, res) => {
        if (err) return done(err)
        var accessToken = res.body.access_token
        api()
          .get('/alice')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(403)
          .expect({reason: 'bob@service.com cannot access /alice'})
          .end((err) => {
            if (err) return done(err)
            api()
              .get('/bob')
              .set('Authorization', 'Bearer ' + accessToken)
              .expect(200)
              .end(done)
          })
      })
  })

  after(done => target.stop(done))
  after(done => gateway.stop(done))
  after(done => authorization.stop(done))
})


function Target (port) {
  var app = express()
  app.get('/alice', needsScope('A'), needsUser('alice@service.com'))
  app.get('/bob', needsScope('A'), needsUser('bob@service.com'))

  function needsScope (scope) {
    return function (req, res, next) {
      if (req.headers['x-scope'].split(',').indexOf(scope) > -1) {
        next()
      } else {
        res.status(403).end()
      }
    }
  }

  function needsUser (email) {
    return function (req, res, next) {
      var userinfo = new Buffer(req.headers['x-userinfo'], 'base64').toString()
      userinfo = JSON.parse(userinfo)
      if (userinfo.email === email) {
        next()
      } else {
        res.status(403).json({
          reason: `${userinfo.email} cannot access ${req.url}` 
        })
      }
    }
  }
  app.use((req, res) => {
    res.json({
      body: req.body,
      headers: req.headers
    })
  })
  Server.call(this, port, app)
}
