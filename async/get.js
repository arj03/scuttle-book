const pull = require('pull-stream')
const nest = require('depnest')
const ref = require('ssb-ref')

module.exports = function (server) {
  return function (key, loadComments, cb) {
    if (!ref.isLink(key)) return cb("Key not a valid reference: " + key)

    if (cb === undefined)
      throw "Please provide callback"

    pull(
      pull.values([key]),
      pull.asyncMap((key, cb) => server.get(key, cb)),
      pull.asyncMap((msg) => hydrate(msg, key, loadComments, cb)),
      pull.drain(cb)
    )
  }

  // internal

  function hydrate(msg, key, loadComments, cb) {
    var book = {
      key,
      common: msg.content,
      subjective: {
        [server.id]: {
          key: '', allKeys: [], rating: '', ratingMax: '', ratingType: '',
          review: '', shelve: '', genre: '', comments: []
        }
      }
    }

    applyAmends(book, (err, updatedBook) => {
      if (err) return cb(err)

      if (loadComments)
        getCommentsOnSubjective(updatedBook, cb)
      else
        cb(null, updatedBook)
    })
  }

  function getCommentsOnSubjective(book, cb)
  {
    let subjectives = Object.values(book.subjective)

    if (subjectives.length == 1 && subjectives[0].key == '') {
      cb(null, book)
    } else {
      let reqs = []
      pull(
        pull.values(Object.values(book.subjective)),
        pull.drain(subj => {
          if (subj.key) {
            pull(
              pull.values(Object.values(subj.allKeys)),
              pull.drain(key => {
                reqs.push(key)
                pull(
                  server.backlinks.read({
                    query: [ {$filter: { dest: key }} ],
                    index: 'DTA', // use asserted timestamps
                  }),
                  pull.drain(msg => {
                    if (msg.sync || !["post", "bookclubComment"].includes(msg.value.content.type)) return
                    if (msg.value.content.root == book.key) return // posts directly on book

                    if (!subj.comments.some(c => c.key == msg.key)) {
                      subj.comments.push(msg.value)
                    }
                  }, (err) => {
                    reqs.pop()
                    if (reqs.length == 0)
                      cb(err, book)
                  })
                )
              })
            )
          }
        })
      )
    }
  }

  function applyAmends(book, cb) {
    let allAuthorKeys = {}

    pull(
      server.backlinks.read({
        query: [ {$filter: { dest: book.key }} ],
        index: 'DTA', // use asserted timestamps
      }),
      pull.drain(msg => {
        if (msg.sync || !["about", "bookclubUpdate"].includes(msg.value.content.type)) return

        const { rating, ratingMax, ratingType, shelve, genre, review } = msg.value.content

        if (!allAuthorKeys[msg.value.author])
          allAuthorKeys[msg.value.author] = []

        let allKeys = allAuthorKeys[msg.value.author]
        allKeys.push(msg.key)

        if (rating || ratingMax || ratingType || shelve || genre || review) {
          book.subjective[msg.value.author] = {
            key: msg.key,
            timestamp: msg.timestamp,
            allKeys,
            rating,
            ratingMax,
            ratingType,
            shelve,
            genre,
            review,
            comments: []
          }
        } else
          book.common = Object.assign({}, book.common, msg.value.content)

      }, (err) => {
        cb(err, book)
      })
    )
  }
}
