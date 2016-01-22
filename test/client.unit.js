var expect = require('chai').expect
var Client = require('../lib/client');

describe('new Client(payload)', function () {
  it('is a constructor', function () {
    expect(new Client()).to.be.an.instanceof(Client)
  })

  describe('.hasScope(hello)', function () {
    describe('with payload {scopes:["hello"]}', function () {
      var client = new Client({scopes:['hello']})
      it('returns true', function () {
        expect(client.hasScope('hello')).to.be.true
      })
    })
    describe('with payload {scopes:["world"]}', function () {
      var client = new Client({scopes:['world']})
      it('returns true', function () {
        expect(client.hasScope('hello')).to.be.false
      })
    })
  })

  describe('.getClientId()', function () {
    describe('with payload {cid:"clientid"}', function () {
      var client = new Client({cid: 'clientid'})
      it('returns "clientid"', function () {
        expect(client.getClientId()).to.equal('clientid')
      })
    })
  })

  describe('.getUserInfo()', function () {
    describe('with payload {userinfo: {firstname: "hello", lastname: "world"}}', function () {
      var client = new Client({userinfo: {firstname: 'hello', lastname: 'world'}})
      it('returns {firstname: hello, lastname: world}', function () {
        expect(client.getUserInfo()).to.deep.equal({
          firstname: 'hello',
          lastname: 'world'
        })
      })
    })
  })
})
