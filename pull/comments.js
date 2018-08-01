const pull = require('pull-stream')
const pullMerge = require('pull-merge')

const allUpdates = require('updates')

module.exports = function (server) {
  return function AllBookCommentsStream (opts) {

    // old comments based on post
    const allBooksOpts = {
      query: [{ $filter: { value: { content: { type: 'bookclub' } } } }]
    }

    const oldComments = pull(
      pull(
        server.query.read(allBooksOpts),
        pull.drain(msg => {
          pull(
            server.query.read({ query: [{ $filter: { dest: msg.key } }] }),
            pull.filter(msg => msg.value.content.type !== "about"),
            pull.drain(msg => {
              pull(
                server.query.read({ query: [{ $filter: { dest: msg.key } }] }),
                pull.filter(msg => msg.value.content.type !== "post")
              )
            })
          )
        })
      )
    )

    const allBookUpdatesOpts = {
      query: [{ $filter: { value: { content: { type: 'bookclubComment' } } } }]
    }

    return pullMerge(
      server.query.read(allBookUpdatesOpts),
      oldComments
    )
  }
}
