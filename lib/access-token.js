var Clients = require('./clients')
var Users = require('./users')
var Scopes = require('./scopes')
var config = require('./authorization-config')
var times = require('./times')
var SignedToken = require('./signed-token')

exports.generate = function (credentials) {
  if (!credentials) throw Error('you must provide credentials')
  var grant_type = credentials.grant_type
  var payload = {}
  var client = Clients.challengeCredentials(credentials.client_id, credentials.client_secret)
  payload.cid = client.id
  if (grant_type === 'password') {
    var user = Users.challengeCredentials(credentials.email, credentials.password)
    payload.userinfo = user
  }
  payload.scope = Scopes.match(credentials.scope, client.scope)
  return SignedToken.create(payload, config.get('secret'), { expiresIn: times.accessTokenDuration })
}
