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
