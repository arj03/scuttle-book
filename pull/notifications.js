const pull = require('pull-stream')
const pullMerge = require('pull-merge')

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
          const { updates, rating, review } = update.value.content
          return bookIds.indexOf(updates) != -1 && (rating || review)
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

    // comments on my ratings
    const myRatingsOpts = {
      query: [{
        $filter: {
          value: {
            content: { type: 'bookclubUpdate' },
            author: myId
          }
        }
      }, {
        $map: {
          id: 'key'
        }
      }]
    }

    var deferredRatings = require('pull-defer').through()

    // load filter based on ratings created
    pull(
      server.query.read(myRatingsOpts),
      pull.collect((err, ratings) => {
        const ratingIds = ratings.map(r => r.id)
        deferredRatings.resolve(pull.filter((comment) => {
          return ratingIds.indexOf(comment.value.content.root) != -1
        }))
      })
    )

    const bookCommentsQuery = {
      query: [{
        $filter: {
          value: {
            content: { type: 'bookclubComment' },
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

    return pullMerge(
      pull(
        server.query.read(Object.assign(bookCommentsQuery, opts)),
        deferredRatings
      ),
      pull(
        server.query.read(Object.assign(bookUpdatesQuery, opts)),
        deferred
      )
    )
  }
}
