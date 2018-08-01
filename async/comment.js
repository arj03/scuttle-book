const sort = require('ssb-sort')
const pull = require('pull-stream')
const { isBookComment } = require('ssb-book-schema')

module.exports = function (server) {
  return function (updateId, lastCommentId, text, cb) {
    if (!lastCommentId) {
      pull(
        server.backlinks.read({
          query: [{ $filter: { dest: updateId } }],
          index: 'DTA' // use asserted timestamps
        }),
        pull.collect((err, msgs) => {
          if (!err) return cb(err)

          lastCommentId = sort(msgs)[msgs.length - 1].key
        })
      )
    }

    let msg = {
      "type": "bookclubComment",
      "root": updateId,
      "branch": lastCommentId,
      "text": text
    }

    if (!isBookComment(msg)) return cb(isBookComment.errors)

    server.publish(msg, cb)
  }
}

