var jsonwebtoken = require('jsonwebtoken')

module.exports = SignedToken

function SignedToken (data, secret, options) {
  Object.assign(this, data)
  Object.defineProperty(this, 'toJSON', {
    value: function () {
      return jsonwebtoken.sign(data, secret, options)
    }
  })
}

SignedToken.create = function (data, secret, options) {
  return new SignedToken(data, secret, options)
}
