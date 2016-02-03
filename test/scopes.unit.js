var expect = require('chai').expect
var Scopes = require('../lib/authorization/scopes')

describe('Scopes', function () {
  describe('.match(queried, authorized)', function () {
    describe('with two empty lists', function () {
      it('returns an empty list', function () {
        expect(Scopes.match([], [])).to.deep.equal([])
      })
    })

    describe('with [] and [A]', function () {
      it('returns []', function () {
        expect(Scopes.match([], ['A'])).to.deep.equal([])
      })
    })

    describe('with [A] and [A]', function () {
      it('returns [A]', function () {
        expect(Scopes.match(['A'], ['A'])).to.deep.equal(['A'])
      })
    })

    describe('with [A] and [A, B]', function () {
      it('returns [A]', function () {
        expect(Scopes.match(['A'], ['A', 'B'])).to.deep.equal(['A'])
      })
    })

    describe('with [C] and [A, B]', function () {
      it('throws', function () {
        expect(() => Scopes.match(['C'], ['A', 'B'])).to.throw(/unauthorized scope/i)
      })
    })
  })
})
