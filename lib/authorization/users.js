var crypto = require('crypto')
var config = require('./config')

exports.challengeCredentials = function (email, password) {
  var users = config.get('users') || []
  var user = users.find(user => user.email === email)
  if (!user) throw Error('Unknown user')
  var passwordHash = crypto.createHash('sha256').update(password).digest('base64')
  if (passwordHash !== user.password_sha256) throw Error('Invalid user credentials')
  return { email: user.email }
}
