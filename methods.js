module.exports = {
  async: {
    get: require('./async/get'),
    create: require('./async/create'),
    update: require('./async/update'),
    comment: require('./async/comment')
  },
  pull: {
    books: require('./pull/books'),
  }
}
