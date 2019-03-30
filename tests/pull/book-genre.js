const test = require('tape')
const Server = require('scuttle-testbot')
const ssbKeys = require('ssb-keys')
const pull = require('pull-stream')

test('pull.books - test genre from v1', t => {
  const keyMe = ssbKeys.generate()

  Server.use(require('ssb-backlinks'))
    .use(require('ssb-query'))

  const Books = require('../../pull/books')
  const Create = require('../../async/create')
  const Update = require('../../async/update')

  const server = Server({name: 'test.async.get', keys: keyMe})
  const allBooks = Books(server)
  const create = Create(server)
  const update = Update(server)

  const book = { type: 'bookclub', title: 'The Disposessed', authors: 'Ursula Le Guin' }
  const v1Subjective = { type: 'about', genre: 'sci-fi' }

  create(book, (err, bookMsg) => {
    if (err) console.error(err)

    v1Subjective.about = bookMsg.key
    
    server.publish(v1Subjective, (err, bookState) => {
      if (err) console.error(err)

      pull(
        allBooks(null, true, false),
        pull.drain((book) => {
          t.equal(book.common.genres, v1Subjective.genre, 'genre from old about moves to book')

          server.close()
          t.end()
        })
      )
    })
  })
})

