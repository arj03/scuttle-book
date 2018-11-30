const { isBookUpdate } = require('ssb-book-schema')

module.exports = function (server) {
  return function (bookId, attributes, cb) {
    let msg = Object.assign({
      "type": "bookclubUpdate",
      "updates": bookId
    }, attributes)

    if (!isBookUpdate(msg)) return cb(msg.errors)

    server.publish(msg, cb)
  }
}
