var Authorization = require('../lib/authorization')
var Gateway = require('../lib/gateway')
var supertest = require('supertest');
var Server = require('../lib/server')
var express = require('express')
var config = require('../lib/config')

var SECRET = 'test-secret'
describe('Client Credentials flow', function () {
  var authorization, gateway, target
  var api = supertest.bind(null, 'http://localhost:9181')
  var auth = supertest.bind(null, 'http://localhost:9182')
  before(() => {
    config.defaults({clients: [{
      id: 'client-id',
      secret: 'client-secret',
      scopes: ['A', 'B', 'C']
    }]})
  })

  before(function () {
    target = new Target(9180)
    gateway = new Gateway({port: 9181, upstream: 'http://localhost:9180', secret: SECRET})
    authorization = new Authorization({port: 9182, secret: SECRET})
  })

  before(done => target.start(done))
  before(done => gateway.start(done))
  before(done => authorization.start(done))

  it('obtains an access token and makes an API call', function (done) {
    auth()
      .post('/token')
      .send({
        client_id: 'client-id',
        client_secret: 'client-secret',
        scope: ['A', 'C'],
      })
      .expect(200)
      .expect('Content-Type', /application\/json/i)
      .end((err, res) => {
        if (err) return done(err)
        var accessToken = res.body.access_token
        api()
          .get('/a')
          .set('Authorization', 'Bearer ' + accessToken)
          .expect(200)
          .end((err, res) => {
            if (err) return done(err);
            api()
              .get('/b')
              .set('Authorization', 'Bearer ' + accessToken)
              .expect(403)
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
  app.get('/b', needsScope('B'))
  app.get('/a', needsScope('A'))

  function needsScope (scope) {
    return function (req, res, next) {
      if (req.headers['x-scope'].split(',').indexOf(scope) > -1) {
        next()
      } else {
        res.status(403).end()
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