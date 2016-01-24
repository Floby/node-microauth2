var config = require('./config');

exports.getById = function (id) {
  return config.get('clients').find(client => client.id === id) || null
}
