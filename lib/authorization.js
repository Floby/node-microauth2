var Server = require('./server')
var jsonwebtoken = require('jsonwebtoken');
var express = require('express');
var bodyParser = require('body-parser');
var AccessToken = require('./access-token')
var times = require('./times')
var util = require('util');

module.exports = Authorization

util.inherits(Authorization, Server);
function Authorization (options) {
  var authorization = this
  var port = options.port
  var secret = options.secret
  var app = express()
  Server.call(this, port, app)

  app.set('json spaces', 2)
  app.post('/token', bodyParser.json(), function (req, res, next) {
    var body = req.body
    if (body.client_id && body.client_secret) {
      var token = AccessToken.generate(body)
      var accessToken = jsonwebtoken.sign(token, secret, {expiresIn: times.accessTokenDuration})
      res.status(200).json({
        access_token: accessToken,
        expires_in: times.accessTokenDuration
      })
    } else {
      next()
    }
  })

  app.use(function (req, res) {
    res.status(400).end()
  })
}

