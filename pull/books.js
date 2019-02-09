const next = require('pull-next-query')
const pull = require('pull-stream')
const paramap = require('pull-paramap')
const getAsync = require('../async/get')

module.exports = function (server) {
  return function AllBooksStream (opts, hydrate, loadComments) {
    const defaultOpts = {
      limit: 100,
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

    if (hydrate)
      return pull(
        next(server.query.read, _opts),
        pull.asyncMap((key, cb) => getAsync(key, loadComments, cb))
      )
    else
      return next(server.query.read, _opts)
  }
}
