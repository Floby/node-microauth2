var jsonwebtoken = require('jsonwebtoken')
var Server = require('./server')
var httpProxy = require('http-proxy')
var util = require('util')

module.exports = Gateway

util.inherits(Gateway, Server)
function Gateway (options) {
  var upstream = options.upstream
  var port = options.port
  var secret = options.secret
  Server.call(this, port, authenticate)

  var proxy = httpProxy.createProxyServer({})
  proxy.on('proxyReq', addHeaders)
  proxy.on('error', function(error, req, res) {
    res.writeHead(503, {
      'Content-Type': 'application/json'
    })
    var json = {
      error: 'service_unavailable',
      reason: error.message
    }
    res.end(JSON.stringify(json))
  })

  function authenticate (req, res) {
    var authorization = req.headers['authorization']
    if (!authorization) return unauthorized(res)
    var token = authorization.replace('Bearer ', '').trim()
    jsonwebtoken.verify(token, secret, function (err, jwt) {
      if (err) return unauthorized(res)
      proxy.web(req, res, { target: upstream, jwt: jwt })
    })

    function unauthorized (res) {
      res.statusCode = 401
      res.end()
    }
  }

  function addHeaders (proxyReq, req, res, options) {
    var jwt = options.jwt
    var scope = jwt.scope || []
    var clientid = jwt.cid
    var userinfo = jwt.userinfo || {}
    var encodedUserInfo = new Buffer(JSON.stringify(userinfo)).toString('base64')
    proxyReq.setHeader('X-clientid', clientid)
    proxyReq.setHeader('X-scope', scope.join(','))
    proxyReq.setHeader('X-userinfo', encodedUserInfo)
  }
}
