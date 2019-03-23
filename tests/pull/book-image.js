const test = require('tape')
const Server = require('scuttle-testbot')
const ssbKeys = require('ssb-keys')
const pull = require('pull-stream')

const keyMe = ssbKeys.generate()

Server.use(require('ssb-backlinks'))
  .use(require('ssb-query'))

const Books = require('../../pull/books')
const Create = require('../../async/create')
const Update = require('../../async/update')

test('pull.books - test genre from v1', t => {
  const server = Server({name: 'test.async.get', keys: keyMe})
  const allBooks = Books(server)
  const create = Create(server)
  const update = Update(server)

  const book = { type: 'bookclub', title: 'The Disposessed', authors: 'Ursula Le Guin', image: {
    link: '&+P7zR+PdwBOsPRCWwF4Gk8aZMP7mlkXZs837fhc5rC0=.sha256', name: 'img'
  } }

  create(book, (err, bookMsg) => {
    if (err) console.error(err)

    pull(
      allBooks(null, true, false),
      pull.drain((book) => {
        t.deepEqual(book.common.images, bookMsg.value.content.image, 'Name upgraded from v1 schem')
        t.deepEqual(book.common.image, bookMsg.value.content.image, 'Still available as old name for backwards compatability')

        server.close()
        t.end()
      })
    )
  })
})

