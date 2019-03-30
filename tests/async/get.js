const test = require('tape')
const Server = require('scuttle-testbot')
const ssbKeys = require('ssb-keys')
const pull = require('pull-stream')

test('async.get - I publish a book and edit it', t => {
  const keyMe = ssbKeys.generate()

  Server.use(require('ssb-backlinks'))

  const Get = require('../../async/get')
  const Create = require('../../async/create')
  const Update = require('../../async/update')

  const server = Server({name: 'test.async.get', keys: keyMe})
  const get = Get(server)
  const create = Create(server)
  const update = Update(server)

  const book = { type: 'bookclub', title: 'The Disposessed', authors: 'Ursula Le Guin' }
  const bookUpdate = { title: 'The Dispossessed', authors: 'Ursula Le Guin' }

  create(book, (err, bookMsg) => {
    if (err) console.error(err)

    get(bookMsg.key, false, (err, bookState) => {
      //console.log(bookState)
      t.equal(bookState.common.title, book.title, 'title working')
      t.equal(bookState.common.authors, book.authors, 'authors working')

      update(bookMsg.key, bookUpdate, (err, bookState) => {
        if (err) console.error(err)

        get(bookMsg.key, false, (err, bookState) => {
          t.equal(bookState.common.title, bookUpdate.title, 'title updates')

          server.close()
          t.end()
        })
      })
    })
  })
})
