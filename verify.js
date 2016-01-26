var jsonwebtoken = require('jsonwebtoken')
var Client = require('./lib/client')

module.exports = Verifier

function Verifier (secret) {
  return function verify(token) {
    return new Client(jsonwebtoken.verify(token, secret))
  }
}
