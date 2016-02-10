var Clients = require('./clients')
var Users = require('./users')
var Scopes = require('./scopes')
var config = require('./config')
var times = require('./times')
var SignedToken = require('./signed-token')

exports.generate = function (credentials) {
  if (!credentials) throw Error('you must provide credentials')
  var grant_type = credentials.grant_type
  var client = getClientForCredentials(credentials)
  if (grant_type !== 'client_credentials') {
    var user = Users.challengeCredentials(credentials.email, credentials.password)
  }
  var scope = Scopes.match(credentials.scope, client.scope)
  var payload = {scope, cid: client.id}
  if (user) payload.userinfo = user
  return SignedToken.create(payload, config.get('secret'), { expiresIn: times.accessTokenDuration })
}

function getClientForCredentials (credentials) {
  if (credentials.grant_type !== 'implicit') {
    return Clients.challengeCredentials(credentials.client_id, credentials.client_secret)
  } else {
    return Clients.getById(credentials.client_id)
  }
}
