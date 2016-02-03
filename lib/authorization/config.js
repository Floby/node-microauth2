var nconf = require('nconf')
var yaml = require('yaml-parser')
var format = {
  parse: yaml.safeLoad.bind(yaml),
  stringify: yaml.safeDump.bind(yaml)
}

nconf.argv()

if(nconf.get('config')) {
  nconf.file({
    file: nconf.get('config'),
    format: format
  })
}

nconf.defaults({clients: [], secret: process.env.MICROAUTH2_SECRET})

module.exports = nconf
