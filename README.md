[![Build Status][travis-image]][travis-url] [![Coverage][coveralls-image]][coveralls-url]

node-microauth2
===============

> Minimal tool to start securing your API with OAuth2

Disclaimer
----------

/!\ **WARNING** README-DRIVEN DEVELOPMENT. ALL FUNCTIONALITIES MAY NOT BE PRESENT YET /!\


Microauth2 aims to provide easy to deploy tools to get started with
securing an API with OAuth2 so you are out of excuses!

It shouldn't take you more than a couple of hours to get you completely started

It uses JWT under the hood in order to provide completely stateless and DB-free microservices.

Microauth2 provides the following things:

+ [ ] An authorization server working out of the box (_todo_)
+ [ ] A gateway to verify tokens and proxy requests to your API (_doing_)
+ [x] A connect/express middleware to automatically verify tokens for your API (_done_)
+ [x] A module to verify tokens (_done_)


Installation
------------

    $ npm install -g microauth2

Or as a module

    $ npm install --save microauth2

Usage
-----

### Authorization Server

You can spawn a minimal authorization server with

    $ microauth2 authorization --config your-config.yml

+ `--config` is the path to your config file in YAML
+ the `MICROAUTH2_SECRET` env variable will be used to sign tokens

### API Gateway

You can spawn a minimal gateway to your API with

    $ microauth2 gateway --upstream http://your.upstream/

+ `--upstream` is the url of your upstream
+ the `MICROAUTH2_SECRET` env variable will be used to verify tokens

### Connect/Express middleware

```javascript
var microauth2 = require('microauth2/middleware')

app.use(microauth2({secret: 'your-secret'}))
app.use(function (req, res, next) {
  req.microauth2.hasScope('scope_to_verify')
  req.microauth2.getClientId()
  req.microauth2.getUserInfo()
})

app.use('/articles', microauth2.needs('articles')) // deny access if scope not granted
```


### Module

```javascript
var microauth2 = require('microauth2')('your-secret')

try {
  var client = microauth2(token)
  client.hasScope('some_scope')
  client.getClientId()
  client.getUserInfo()
} catch (error) {
  // token does not check out
}
```

Limitations
-----------

Microauth2 only currently supports the following grants:

+ Client Credentials

Test
----

You can run the tests with `npm test`. You will need to know [mocha][mocha-url]

Contributing
------------

Anyone is welcome to submit issues and pull requests


License
-------

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016 Florent Jaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[travis-image]: http://img.shields.io/travis/Floby/node-microauth2/master.svg?style=flat
[travis-url]: https://travis-ci.org/Floby/node-microauth2
[coveralls-image]: http://img.shields.io/coveralls/Floby/node-microauth2/master.svg?style=flat
[coveralls-url]: https://coveralls.io/r/Floby/node-microauth2
[mocha-url]: https://github.com/visionmedia/mocha


