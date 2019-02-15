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

test('pull.books - get hydrated version', t => {
  const server = Server({name: 'test.async.get', keys: keyMe})
  const allBooks = Books(server)
  const create = Create(server)
  const update = Update(server)

  const book = { type: 'bookclub', title: 'The Disposessed', authors: 'Ursula Le Guin' }
  const bookUpdate = { title: 'The Dispossessed', authors: 'Ursula Le Guin' }

  create(book, (err, bookMsg) => {
    if (err) console.error(err)

    update(bookMsg.key, bookUpdate, (err, bookState) => {
      if (err) console.error(err)

      pull(
        allBooks(null, true, false),
        pull.drain((book) => {
          t.equal(book.common.title, bookUpdate.title, 'title updates')

          server.close()
          t.end()
        })
      )
    })
  })
})

