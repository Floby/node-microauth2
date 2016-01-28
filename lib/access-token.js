var Clients = require('./clients')
var Scopes = require('./scopes')
var config = require('./authorization-config')
var times = require('./times')
var SignedToken = require('./signed-token')

exports.generate = function (credentials) {
  if (!credentials) throw Error('you must provide credentials')
  var client = Clients.challengeCredentials(credentials.client_id, credentials.client_secret)
  return new SignedToken({
    cid: credentials.client_id,
    scope: Scopes.match(credentials.scope, client.scope)
  }, config.get('secret'), { expiresIn: times.accessTokenDuration })
}
