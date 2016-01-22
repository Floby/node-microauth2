var jsonwebtoken = require('jsonwebtoken');
var Client = require('./lib/client')

module.exports = Middleware

function Middleware (options) {
  var secret = options.secret

  return function (req, res, next) {
    var authorization = req.headers['authorization'];
    if (!authorization) {
      return res.status(401).end()
    }
    authorization = authorization.replace('Bearer ', '').trim()

    try {
      req.microauth2 = new Client(jsonwebtoken.verify(authorization, secret))
    } catch (e) {
      return res.status(401).end()
    }
    next()
  }
}

Middleware.needs = function (scope) {
  return function (req, res, next) {
    if (!req.microauth2) {
      return next(Error('not authorizes via microauth2'))
    } else if (!req.microauth2.hasScope(scope)) {
      return res.status(403).end()
    } else {
    next()
    }
  }
}
