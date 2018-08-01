const pull = require('pull-stream')
const pullMerge = require('pull-merge')

module.exports = function (server) {
  return function AllBookUpdatesStream (opts) {

    // old updates based on about
    const allBooksOpts = {
      query: [{ $filter: { value: { content: { type: 'bookclub' } } } }]
    }

    const oldUpdates = pull(
      server.query.read(allBooksOpts),
      pull.drain(msg => {
        pull(
          server.query.read({ query: [{ $filter: { dest: msg.key } }] }),
          pull.filter(msg => msg.value.content.type !== "about")
        )
      })
    )

    const allBookUpdatesOpts = {
      query: [{ $filter: { value: { content: { type: 'bookclubUpdate' } } } }]
    }

    return pullMerge(
      server.query.read(allBookUpdatesOpts),
      oldUpdates
    )
  }
}
