module.exports = function (locals, children) {
  var page =
    `
      <!doctype html>
      <html>
        <head>
          <title>Authorize an application</title>
          <!-- Compiled and minified CSS -->
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.5/css/materialize.min.css">
        </head>
        <body>
          <div class="container">
              ${children}
          </div>
          <!-- Compiled and minified JavaScript -->
          <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.5/js/materialize.min.js"></script>
        </body>
      </html>
    `
  return page
}
