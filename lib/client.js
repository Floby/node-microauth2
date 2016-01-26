var extend = require('extend')

module.exports = Client

function Client (payload) {
  payload = payload || {}
  var data = {scope: [], userinfo: {}}
  data.scope = [].concat(payload.scope || [])
  data.clientId = payload.cid
  data.userInfo = extend(true, {}, payload.userinfo)

  this.hasScope = function (name) {
    return data.scope.indexOf(name) > -1
  }

  this.getClientId = function () {
    return data.clientId
  }

  this.getUserInfo = function () {
    return data.userInfo
  }
}
