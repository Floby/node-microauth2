var http = require('http');
var jsonwebtoken = require('jsonwebtoken');
var express = require('express');
var bodyParser = require('body-parser');

module.exports = Authorization

function Authorization (options) {
  var authorization = this
  var port = options.port
  var secret = options.secret
  var app = express()
  var server = http.createServer(app)

  app.set('json spaces', 2)
  app.post('/token', bodyParser.json(), function (req, res, next) {
    var body = req.body
    if (body.client_id && body.client_secret) {
      var accessToken = jsonwebtoken.sign({
        cid: body.client_id,
        scopes: body.scopes
      }, secret)
      res.status(200).json({
        access_token: accessToken,
        expires_in: 7200
      })
    } else {
      next()
    }
  })

  app.use(function (req, res) {
    res.status(400).end()
  })


  this.start = function (cb) {
    server.listen(port, function (err) {
      if (err) return cb(err)
      authorization.port = server.address().port
      cb()
    })
  }
  this.stop = function (cb) {
    server.close(cb)
  }
}

