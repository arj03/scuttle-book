const pull = require('pull-stream')
const nest = require('depnest')

module.exports = function (server) {
  return function (key, loadComments, cb) {
    if (cb === undefined)
      throw "Please provide callback"

    pull(
      pull.values([key]),
      pull.asyncMap((key, cb) => server.get(key, cb)),
      pull.asyncMap((msg, cb) => hydrate(msg, key, loadComments, (data) => cb(null, data))),
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

    applyAmends(book, updatedBook => loadComments ? getCommentsOnSubjective(updatedBook, cb) : cb(updatedBook))
  }

  function getCommentsOnSubjective(book, cb)
  {
    let subjectives = Object.values(book.subjective)

    if (subjectives.length == 1 && subjectives[0].key == '')
      cb(book)
    else {
      pull(
        pull.values(Object.values(book.subjective)),
        pull.drain(subj => {
          if (subj.key) {
            pull(
              pull.values(Object.values(subj.allKeys)),
              pull.drain(key => {
                pull(
                  server.backlinks.read({
                    query: [ {$filter: { dest: key }} ],
                    index: 'DTA', // use asserted timestamps
                  }),
                  pull.drain(msg => {
                    if (msg.sync || !["post", "bookclubComment"].includes(msg.value.content.type)) return

                    if (!subj.comments.some(c => c.key == msg.key)) {
                      subj.comments.push(msg.value)
                    }
                  }, () => cb(book))
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

      }, () => {
        cb(book)
      })
    )
  }
}
