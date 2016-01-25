var Clients = require('./clients');
var Scopes = require('./scopes');

exports.generate = function (credentials) {
  if (!credentials) throw Error('you must provide credentials')
  var client = Clients.getById(credentials.client_id);
  if (client.secret !== credentials.client_secret) {
    throw Error('invalid credentials')
  }
  return {
    cid: credentials.client_id,
    scope: Scopes.match(credentials.scope, client.scope)
  }
}
