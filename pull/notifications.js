const pull = require('pull-stream')

module.exports = function (server) {
  return function NotificationsStream (myId, opts) {

    const myBooksOpts = {
      query: [{
        $filter: {
          value: {
            content: { type: 'bookclub' },
            author: myId
          }
        }
      }, {
        $map: {
          id: 'key'
        }
      }]
    }

    var deferred = require('pull-defer').through()

    // load filter based on books created
    pull(
      server.query.read(myBooksOpts),
      pull.collect((err, books) => {
        const bookIds = books.map(book => book.id)
        deferred.resolve(pull.filter((update) => {
          return bookIds.indexOf(update.value.content.updates) != -1
        }))
      })
    )
    
    const bookUpdatesQuery = {
      query: [{
        $filter: {
          value: {
            content: { type: 'bookclubUpdate' },
          }
        }
      }, {
        $filter: {
          value: {
            author: { $ne: myId } // not my messages!
          }
        }
      }]
    }

    return pull(
      server.query.read(Object.assign(bookUpdatesQuery, opts)),
      deferred
    )
  }
}
