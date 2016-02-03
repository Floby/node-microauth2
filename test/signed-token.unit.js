var expect = require('chai').expect
var jsonwebtoken = require('jsonwebtoken')
var SignedToken = require('../lib/authorization/signed-token')

describe('new SignedToken(data, secret, options)', function () {
  describe('.toJSON()', function () {
    it('is a signed jwt with these options', function () {
      var data = {hello: 'goodbye'}
      var signedToken = new SignedToken(data, 'somesecret', {expiresIn: 100})
      var expected = jsonwebtoken.sign(data, 'somesecret', {expiresIn: 100})
      expect(signedToken.toJSON()).to.equal(expected)
    })
  })
})

describe('SignedToken.create(data, secret, options)', function () {
  it('calls new SignedToken(data, secret, options)', function () {
    var data = {hello: 'goodbye'}
    var expected = new SignedToken(data, 'somesecret', {expiresIn: 100})
    var actual = SignedToken.create(data, 'somesecret', {expiresIn: 100})
    expect(actual.toJSON()).to.equal(expected.toJSON())
  })
})
