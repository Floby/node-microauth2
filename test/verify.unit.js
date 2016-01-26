var expect = require('chai').expect
var jsonwebtoken = require('jsonwebtoken')
var Client = require('../lib/client')

var Verifier = require('../verify')

describe('verify(token)', function () {
  var SECRET = 'my-test-secret'
  var verify = new Verifier(SECRET)
  var token = jsonwebtoken.sign({cid: 'hey'}, SECRET)

  it('construct a Client instance', function () {
    expect(verify(token)).to.be.an.instanceof(Client)
    expect(verify(token).getClientId()).to.equal('hey')
  })
})
