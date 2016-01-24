var sinon = require('sinon');
var expect = require('chai').expect
var Clients = require('../lib/clients');
var config = require('../lib/authorization-config')

describe('Clients', function () {
  var clients = [
    {
      id: 'hello',
      secret: 'secret',
      scopes: ['one', 'or', 'two', 'scopes']
    }
  ]
  beforeEach(function () {
    sinon.stub(config, 'get').withArgs('clients').returns(clients)
  })
  afterEach(function () {
    config.get.restore()
  })
  describe('getById(id)', function () {
    describe('when the client does not exist', function () {
      it('returns null', function () {
        expect(Clients.getById('nothing')).to.be.null
      })
    })

    describe('when the client exists', function () {
      it('returns its record', function () {
        var client = Clients.getById('hello')
        expect(client).to.be.an('object')
        expect(client).to.deep.equal({
          id: 'hello',
          secret: 'secret',
          scopes: ['one', 'or', 'two', 'scopes']
        })
      })
    })
  })
})
