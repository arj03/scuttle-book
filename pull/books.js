const next = require('pull-next-query')
const pull = require('pull-stream')
const paramap = require('pull-paramap')
const getAsync = require('../async/get')

module.exports = function (server) {
  return function AllBooksStream (opts, hydrate, loadComments) {
    const defaultOpts = {
      query: [{
        $filter: {
          value: {
            timestamp: { $gt: 0 },
            content: {
              type: 'bookclub'
            }
          }
        }
      }]
    }
    const _opts = Object.assign({}, defaultOpts, opts)

    if (hydrate) {
      const getter = getAsync(server)
      return pull(
        next(server.query.read, _opts),
        paramap((bookMsg, cb) => getter(bookMsg.key, loadComments, (err, book) => {
          book.msg = bookMsg
          cb(err, book)
        }), 16)
      )
    }
    else
      return next(server.query.read, _opts)
  }
}
