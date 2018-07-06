const inject = require('./inject')

const methods = {
  async: {
    comment: require('./async/comment'),
    create: require('./async/create'),
    // get: require('./async/get'),
    update: require('./async/update'),
  },
  obs: {
    // authors: require('./obs/authors'),
    get: require('./obs/get'),
    // shelves: require('./obs/shelves'),
  },
  // pull: {
  //   books: require('./pull/books'),
  //   comments: require('./pull/comments'),
  //   updates: require('./pull/updates'),
  // },
  sync: {
    isBook: require('./sync/isBook'),
    // isBookComment: require('./async/isBookComment'),
    // isBookUpdate: require('./async/isBookUpdate'),
  }
}

// Note : if you don't like this export pattern, there's no reason we can't add different mappings !!
//  e.g. book.validate.bookComment

module.exports = function Book (server, opts) {
  if (!server.about) throw new Error('scuttle-book requires you to have the ssb-about plugin installed')

  return inject(server, methods)
}


// auto-inject the ssb-server to all methods to reduce repitition
function inject (server, methods) {
  for (var key in methods) {
    if (typeof methods[key] === 'function') {
      methods[key] = methods[key](server)

    }
    else {
      methods[key] = inject(server, methods[key])
    }
  }

  return methods
}


