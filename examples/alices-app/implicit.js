module.exports = function (authorization_url) {
  return `
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <script type="text/javascript" charset="utf-8" src="http://code.jquery.com/jquery-2.2.0.min.js"></script>
  <title>Alices App</title>
</head>
<body>
  <h1>Alices app</h1>
  <h2>Implicit Grant</h2>
  <br>
  <button id="start-flow">
    Get authorized
  </button>

<pre id="result">

</pre>
  <script type="text/javascript" charset="utf-8">
if (location.hash.length > 1) {
  var hash = location.hash.replace('#', '')
  var result = hash.split('&').map(function (field) {
    return field.split('=')
  }).reduce(function (result, pair) {
    result[pair[0]] = pair[1]
    return result;
  }, {})
  $('#result').text(JSON.stringify(result, null, '  '))
  location.hash = ''
}

$("#start-flow").on('click', function () {
  window.location = "${authorization_url}"
})
  </script>
</body>
</html>

`
}
