var sinon = require('sinon')
var expect = require('chai').expect
var Users = require('../lib/users')
var config = require('../lib/authorization-config')

describe('Users', function () {
  var users = [
    { email: 'alice', password_sha256: 'XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg='}
  ]
  beforeEach(function () {
    sinon.stub(config, 'get').withArgs('users').returns(users)
  })
  afterEach(function () {
    config.get.restore()
  })
  describe('challengeCredentials(email, password)', function () {
    describe('when there is no user with this email', function () {
      it('throws', function () {
        expect(() => Users.challengeCredentials('bob', 'pass')).to.throw(/unknown user/i)
      })
    })
    describe('when there is a user but the password does not match', function () {
      it('throws', function () {
        expect(() => Users.challengeCredentials('alice', 'pass')).to.throw(/invalid user credentials/i)
      })
    })

    describe('when there is a user and the password matches', function () {
      it('returns the userinfo', function () {
        expect(Users.challengeCredentials('alice', 'password')).to.deep.equal({
          email: 'alice'
        })
      })
    })
  })
})
