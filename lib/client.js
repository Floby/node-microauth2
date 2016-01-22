var extend = require('extend');

module.exports = Client

function Client (payload) {
  payload = payload || {}
  var data = {scopes: [], userinfo: {}}
  data.scopes = [].concat(payload.scopes || [])
  data.clientId = payload.cid
  data.userInfo = extend(true, {}, payload.userinfo)

  this.hasScope = function (name) {
    return payload.scopes.indexOf(name) > -1
  }

  this.getClientId = function () {
    return data.clientId;
  }

  this.getUserInfo = function () {
    return data.userInfo
  }
}
