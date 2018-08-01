const { isBook } = require('ssb-book-schema')

module.exports = function (server) {
  return function (book, cb) {
    if (!isBook(book)) return cb(isBook.errors)

    server.publish(book, cb)
  }
}

