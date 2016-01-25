exports.match = function (queried, authorized) {
  for (var i = 0; i < queried.length; ++i) {
    if (authorized.indexOf(queried[i]) < 0) {
      throw Error('unauthorized scope ' + queried[i])
    }
  }
  return [].concat(queried)
}
