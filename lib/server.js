var http = require('http')

module.exports = Server

function Server (port, onRequest) {
  var server = this
  var httpServer = http.createServer(onRequest)

  this.start = function (cb) {
    httpServer.listen(port, function (err) {
      if (err) return cb(err)
      server.port = httpServer.address().port
      cb()
    })
  }
  this.stop = function (cb) {
    httpServer.close(cb)
  }
}
