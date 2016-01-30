var bodyParser = require('body-parser')
var bformat = require('bunyan-format')
var express = require('express')
var superagent = require('supertest')
var CLIENT_ID = 'client-A'
var CLIENT_SECRET = '577067ae-c2e1-11e5-bf25-9f5314291cbe'

var authorization = superagent(process.env.AUTHORIZATION_SERVER_URL)

var app = express()
app.use(require('express-bunyan-logger')({
  stream: bformat({outputMode: 'simple'})
}))
app.set('json spaces', 2)
app.use(express.static(__dirname + '/alices-app'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.get('/api/client-credentials', function (req, res, next) {
  authorization
    .post('/token')
    .send({grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET, scope: 'profile'})
    .expect(200)
    .end(function (err, response) {
      if (err) return next(err)
      res.json(response.body)
    })
})

app.post('/api/resource-owner-credentials', function (req, res, next) {
  authorization
    .post('/token')
    .send({grant_type:'password', client_id: CLIENT_ID, client_secret: CLIENT_SECRET, scope: 'profile',
          email: req.body.email, password: req.body.password})
    .expect(200)
    .end(function (err, response) {
      if (err) return next(err)
      res.json(response.body)
    })
})


app.listen(process.env.PORT, function (err) {
  if (err) throw err
  console.log('server listening')
})

