import sinon from 'sinon'
import Promise from 'bluebird'
import chai from 'chai'

chai.should()
chai.use(require('sinon-chai'))
require('source-map-support').install()

import thorp from './index'
var { Response } = thorp

describe('thorp', () => {
  var res, next
  beforeEach(function() {
    var json = sinon.stub()
    res = {
      status: sinon.stub().returns({ json }),
      send: sinon.stub(),
      json,
    }

    next = sinon.stub()
  })

  var call = handler => thorp(handler)(null, res, next)

  it('forwards promised string as result with 200 status', () => {
    return call(req => Promise.resolve('baby'))
    .then(() => {
      res.json.should.have.been.calledWith('baby')
      res.status.should.not.have.been.called
      next.should.not.have.been.called
    })
  })

  it('forwards promised Response\'s status and data', () => {
    var code = 201
    var data = 'yo'
    var response = new Response(code, data)
    return call(req => Promise.resolve(response))
    .then(() => {
      res.json.should.have.been.calledWith(data)
      res.status.should.have.been.calledWith(code)
    })
  })

  it('forwards unfulfilled promised Response\'s status and data', () => {
    var code = 404
    var data = 'tots'
    var response = new Response(code, data)
    return call(req => Promise.reject(response))
    .then(() => {
      throw Error('Promise should have failed')
    })
    .catch(() => {
      res.json.should.have.been.calledWith(data)
      res.status.should.have.been.calledWith(code)
    })
  })

  it('forwards unknown error to next', () => {
    var err = Error('yar')
    return call(req => Promise.reject(err))
    .then(() => {
      res.json.should.not.have.been.called
      res.status.should.not.have.been.called
      next.should.have.been.calledWith(err)
    })
  })
})
