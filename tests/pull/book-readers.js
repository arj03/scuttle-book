const test = require('tape')
const Server = require('scuttle-testbot')
const ssbKeys = require('ssb-keys')
const pull = require('pull-stream')

test('pull.books - get hydrated version', t => {
  const keyMe = ssbKeys.generate()
  const keyOther = ssbKeys.generate()

  Server.use(require('ssb-backlinks'))
    .use(require('ssb-query'))

  const Books = require('../../pull/books')
  const Create = require('../../async/create')
  const Update = require('../../async/update')

  const server = Server({ name: 'test.async.get', keys: keyMe })
  const allBooks = Books(server)
  const create = Create(server)

  let feedMe = server.createFeed(keyMe)
  let feedOther = server.createFeed(keyOther)
  
  const book = { type: 'bookclub', title: 'The Disposessed', authors: 'Ursula Le Guin' }
  const bookUpdate = { type: 'bookclubUpdate', title: 'The Dispossessed', authors: 'Ursula Le Guin' }

  feedMe.add(book, (err, bookMsg) => {
    if (err) console.error(err)

    bookUpdate.updates = bookMsg.key

    feedOther.add(bookUpdate, (err, updateMsg) => {
      if (err) console.error(err)

      pull(
        allBooks(null, true, false),
        pull.drain((book) => {
          t.equal(book.common.title, bookUpdate.title, 'title updates')
          t.deepEqual(book.readers, [keyOther.id, keyMe.id], 'readers works')

          server.close()
          t.end()
        })
      )
    })
  })
})

