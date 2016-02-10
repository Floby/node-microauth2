var layout = require('./layout')
module.exports = function (locals) {
  var form =
    `
    <form id="authorization-form" method="POST">
      <div class="row">
        <h5 class="col s12">Allow this application?</h5>
        <p class="col s12"><i>Log in to allow access to this application</i></p>
      </div>
      <div class="row">
        <input name="client_id" type="hidden" value="${locals.client_id}"/>
        <input name="state" type="hidden" value="${locals.state}"/>
        <div class="col s5">
          <label for="email">E-mail</label>
          <br>
          <input id="email" name="email" type="email" />
        </div>
        <div class="col s5">
          <label for="password">Password</label>
          <br>
          <input id="password" name="password" type="password" />
        </div>
        <div class="col s2">
          &nbsp;<br>
          <button class="btn" name="submit" type="submit">
            Authorize App
          </button>
        </div>
      </div>
    </form>
    `
  return layout(locals, form)
}
