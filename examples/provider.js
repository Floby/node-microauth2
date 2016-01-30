var bodyParser = require('body-parser')
var bformat = require('bunyan-format')
var express = require('express')

var app = express()
app.use(require('express-bunyan-logger')({
  stream: bformat({outputMode: 'simple'})
}))
app.set('json spaces', 2)
app.use(bodyParser())
app.use(function (req, res) {
  res.json({
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers
  })
})
app.listen(process.env.PORT, function (err) {
  if (err) throw err
  console.log('server listening')
})
