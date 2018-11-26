const { isBook } = require('ssb-book-schema')

module.exports = function (server) {
  return function (book, cb) {
    if (!isBook(book)) return cb(book.errors)

    server.publish(book, cb)
  }
}

