const test = require('tape')
const Server = require('scuttle-testbot')
const ssbKeys = require('ssb-keys')
const pull = require('pull-stream')

test('async.old - Mixing old and new style updates and comments', t => {
  const keyMe = ssbKeys.generate()

  Server.use(require('ssb-backlinks'))

  const Get = require('../../async/get')
  const Create = require('../../async/create')
  const Update = require('../../async/update')

  const server = Server({name: 'test.async.old', keys: keyMe})
  const get = Get(server)
  const create = Create(server)
  const update = Update(server)

  const book = { type: 'bookclub', title: 'The Disposessed', authors: 'Ursula Le Guin' }
  const bookUpdate = { title: 'The Dispossessed', authors: 'Ursula Le Guin' }
  const bookReview = { review: 'Great!' } // FIXME: can't be mixed rigth now

  create(book, (err, bookMsg) => {
    if (err) console.error(err)

    server.publish({ type: 'about', about: bookMsg, title: 'The Possessed' }, () => {
    
      get(bookMsg.key, false, (err, bookState) => {
        t.equal(bookState.common.title, 'The Possessed', 'v1 schema update working')

        update(bookMsg.key, bookUpdate, (err) => {
          if (err) console.error(err)

          get(bookMsg.key, false, (err, bookState) => {
            t.equal(bookState.common.title, bookUpdate.title, 'title updates')

            update(bookMsg.key, bookReview, (err, bookReviewMsg) => {
              if (err) console.error(err)

              server.publish({ type: 'post', text: 'test', root: bookReviewMsg.key, branch: bookReviewMsg.key }, () => {

                get(bookMsg.key, true, (err, bookState) => {
                  t.equal(bookState.reviews[keyMe.id].comments[0].value.content.text, 'test', 'old comments are still working')

                  server.close()
                  t.end()
                })
              })
            })
          })
        })
      })
    })
  })
})

