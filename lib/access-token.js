var Clients = require('./clients')
var Scopes = require('./scopes')
var config = require('./authorization-config')
var times = require('./times')
var SignedToken = require('./signed-token')

exports.generate = function (credentials) {
  if (!credentials) throw Error('you must provide credentials')
  var client = Clients.getById(credentials.client_id)
  if (client.secret !== credentials.client_secret) {
    throw Error('invalid credentials')
  }
  return new SignedToken({
    cid: credentials.client_id,
    scope: Scopes.match(credentials.scope, client.scope)
  }, config.get('secret'), { expiresIn: times.accessTokenDuration })
}
