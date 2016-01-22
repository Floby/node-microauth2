var jsonwebtoken = require('jsonwebtoken');
var http = require('http');
var httpProxy = require('http-proxy');

module.exports = Gateway

function Gateway (options) {
  var gateway = this
  var upstream = options.upstream
  var port = options.port
  var secret = options.secret

  var server = http.createServer(authenticate)
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
  });

  function authenticate (req, res) {
    var authorization = req.headers['authorization']
    if (!authorization) {
      res.statusCode = 401;
      res.end()
    } else {
      var token = authorization.replace('Bearer ', '').trim()
      try {
        var jwt = jsonwebtoken.verify(token, secret)
        proxy.web(req, res, { target: upstream, jwt: jwt })
      } catch (e) {
        res.statusCode = 403
        res.end()
      }
    }
  }

  function addHeaders (proxyReq, req, res, options) {
    var jwt = options.jwt
    var scopes = jwt.scopes || []
    var clientid = jwt.cid
    var userinfo = jwt.userinfo || {}
    var encodedUserInfo = new Buffer(JSON.stringify(userinfo)).toString('base64')
    proxyReq.setHeader('X-clientid', clientid)
    proxyReq.setHeader('X-scopes', scopes.join(','))
    proxyReq.setHeader('X-userinfo', encodedUserInfo)
  }

  this.start = function (cb) {
    server.listen(port, function (err) {
      if (err) return cb(err)
      gateway.port = server.address().port
      cb()
    })
  }
  this.stop = function (cb) {
    server.close(cb)
  }
}
