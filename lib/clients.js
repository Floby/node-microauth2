var config = require('./authorization-config')

exports.getById = function (id) {
  return config.get('clients').find(client => client.id === id) || null
}
exports.challengeCredentials = function (id, secret) {
  var client = this.getById(id)
  if(!client) throw Error('Unkown client')
  if(client.secret !== secret) throw Error('Invalid client credentials')
  return client
}
