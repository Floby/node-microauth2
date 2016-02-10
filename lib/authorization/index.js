var querystring = require('querystring')
var Server = require('../server')
var express = require('express')
var bodyParser = require('body-parser')
var AccessToken = require('./access-token')
var times = require('./times')
var util = require('util')
var jsonwebtoken = require('jsonwebtoken')
var config = require('./config')
var authorizeView = require('./views/authorize')
var Clients = require('./clients')

module.exports = Authorization

util.inherits(Authorization, Server)
function Authorization (options) {
  var port = options.port
  var app = express()
  Server.call(this, port, app)

  app.set('json spaces', 2)
  app.post('/token', bodyParser.urlencoded({extended: false}), bodyParser.json())
  app.post('/token', Authorization.sanitizeRequest, function (req, res, next) {
    var body = req.body
    if (body.client_id && body.client_secret) {
      var token = AccessToken.generate(body)
      res.status(200).json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: times.accessTokenDuration
      })
    } else {
      next()
    }
  })

  app.get('/authorize', function (req, res) {
    var client_id = req.query.client_id
    var scope = castToScopeArray(req.query.scope)
    var secret = client_id + ':' + config.get('secret')
    var state = jsonwebtoken.sign({client_id, scope}, secret)
    res.header('X-State', state)
    res.send(authorizeView({client_id, state}, state))
  })

  app.post('/authorize', bodyParser.urlencoded({extended: false}), function (req, res, next) {
    if (!req.body.state) return next()
    var client_id = req.query.client_id
    var secret = client_id + ':' + config.get('secret')
    try {
      var state = jsonwebtoken.verify(req.body.state, secret)
    } catch(e) {
      return next()
    }
    var token = AccessToken.generate({
      grant_type: 'implicit',
      scope: state.scope,
      client_id: client_id,
      email: req.body.email,
      password: req.body.password
    })
    var client = Clients.getById(client_id)
    var data = querystring.encode({
      access_token: token.toJSON(),
      token_type: 'Bearer',
      expires_in: times.accessTokenDuration
    })
    res
      .status(301)
      .header('Location', `${client.callback_implicit}#${data}`)
      .end()
  })

  app.use(function (req, res) {
    res.status(400).end()
  })
}

Authorization.sanitizeRequest = function sanitizeRequest(req, res, next) {
  authorizationToClientCredentials(req)
  scopeToStringArray(req)
  next()
}

function scopeToStringArray (req) {
  if (req.body && req.body.scope) {
    req.body.scope = castToScopeArray(req.body.scope)
  }
  if (req.query && req.query.scope) {
    req.query.scope = castToScopeArray(req.query.scope)
  }
}

function castToScopeArray (scope) {
  if (typeof scope === 'string') {
    scope = scope
      .split(/\+|,|(\s)+/g)
      .filter(scope => scope && scope.trim())
  }
  return scope
}

function authorizationToClientCredentials (req) {
  var authorization = req.headers['authorization']
  if (req.body && authorization && /^basic /i.test(authorization)) {
    var auth = authorization.replace(/^basic ?/i, '')
    auth = new Buffer(auth, 'base64').toString().split(':')
    req.body.client_id = auth[0]
    req.body.client_secret = auth[1]
  }
}

