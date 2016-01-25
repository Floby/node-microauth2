var nconf = require('nconf')

nconf.argv()

if(nconf.get('config')) {
  nconf.file({
    file: nconf.get('config'),
    format: require('nconf-yaml')
  })
}

nconf.defaults({clients: [], secret: process.env.MICROAUTH2_SECRET})

module.exports = nconf;
