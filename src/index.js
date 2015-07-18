var _ = require('lodash')
var Promise = require('bluebird')

function Response(code, payload) {
  if (! (this instanceof Response))
    return new Response(code, payload)

  this.code = code
  this.payload = payload // may be undefined
}

var wrapCallback = module.exports = function(func) {
  return function(req, res, next) {
    return Promise.resolve(func(req, res)).then(function(response) {
      if (response instanceof Response) {
        if (response.payload)
          res.status(response.code).json(response.payload)
        else
          res.status(response.code).send()
      }
      else {
        if (response instanceof Buffer)
          res.send(response)
        else
          res.json(response)
      }
    })
    .catch(function(err) {
      if (err instanceof Response) {
        if (err.payload)
          res.status(err.code).json(err.payload)
        else
          res.status(err.code).send()
      }
      else {
        next(err)
      }
    })
  }
}

wrapCallback.Response = Response
