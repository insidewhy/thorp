# thorp

[![build status](https://circleci.com/gh/ohjames/thorp.png)](https://circleci.com/gh/ohjames/thorp)

A way of building express handlers and middleware using promises to avoid rightward drift.

Instead of:

```javascript
router.get('/user/:userId', function(req, res, next) {
  return User.findOneById(req.params.userId, function(err, user) {
    if (err) {
      next(err)
    }
    else if (! user) {
      res.status(404)
    }
    else {
      return user.getTickets(function(err, userWithTickets) {
        if (err) {
          next(err)
        }
        else {
          userWithTickets.verifyToken(req, function(err, verifiedUser) {
            if (err)
              next(err)
            else
              res.status(200).json(verifiedUser)
          })
        }
      })
    })
  })
})
```

Assuming your database layer supports promises along with callbacks you can use thorp to write a much shorter version.

First include thorp:
```javascript
var thorp = require('thorp')
var Response = thorp.Response
```

Then you can write much shorter response handlers using promises:

```javascript
router.get('/user/:userId', thorp(function(req) {
  return User.findOneById(req.params.userId)
  .then(function(user) {
     // throw a response to indicate an error response and avoid processing
     // of subsequent `then` branches
     if (! user)
       throw Response(404)

    return user.getTickets()
  })
  .then(function(user) {
    return user.verifyToken(req)
  })
}))
```
