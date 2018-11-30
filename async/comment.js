const sort = require('ssb-sort')
const pull = require('pull-stream')
const { isBookComment } = require('ssb-book-schema')

module.exports = function (server) {
  function postComment(updateId, lastCommentId, text, cb) {
    let msg = {
      "type": "bookclubComment",
      "root": updateId,
      "branch": lastCommentId,
      "text": text
    }

    if (!isBookComment(msg)) return cb(msg.errors)

    server.publish(msg, cb)
  }

  return function (updateId, lastCommentId, text, cb) {
    if (!lastCommentId) {
      pull(
        server.backlinks.read({
          query: [{ $filter: { dest: updateId } }],
          index: 'DTA' // use asserted timestamps
        }),
        pull.collect((err, msgs) => {
          if (err) return cb(err)

          if (msgs.length == 0)
            lastCommentId = updateId
          else
            lastCommentId = sort(msgs)[msgs.length - 1].key

          postComment(updateId, lastCommentId, text, cb)
        })
      )
    }
    else
    {
      postComment(updateId, lastCommentId, text, cb)
    }
  }
}

