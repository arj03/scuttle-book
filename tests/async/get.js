const test = require('tape')
const Server = require('scuttle-testbot')
const ssbKeys = require('ssb-keys')
const { watch } = require('mutant')
const { isBlob } = require('ssb-ref')
const pull = require('pull-stream')

const keyMe = ssbKeys.generate()
const keyOther = ssbKeys.generate()

Server.use(require('ssb-backlinks'))

const Get = require('../../async/get')

test('async.get - I publish a book and edit it', t => {
  const server = Server({name: 'test.async.get', keys: keyMe})
  const get = Get(server)

  const feedMe = server.createFeed(keyMe)
  const feedOther = server.createFeed(keyOther)

  const book = {type: 'bookclub', title: 'The Disposessed', author: 'Ursula Le Guin'}

  feedMe.add(book, (err, bookMsg) => {
    const bookKey = bookMsg.key

    get(bookKey, (bookState) => {
      t.deepEqual(bookState.title, 'The Dispossessed', 'title working')
    })
  })
})

