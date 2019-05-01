const test = require('tape')
const Server = require('scuttle-testbot')
const ssbKeys = require('ssb-keys')
const pull = require('pull-stream')
const Notifications = require('../../pull/notifications')

test('pull.notifications - as used in patchbay', t => {
  const keyMe = ssbKeys.generate()
  const keyOther = ssbKeys.generate()

  Server.use(require('ssb-backlinks'))
    .use(require('ssb-query'))

  const Books = require('../../pull/books')
  const Create = require('../../async/create')
  const Update = require('../../async/update')

  const server = Server({ name: 'test.async.get', keys: keyMe })

  const notifications = Notifications(server)
  
  let feedMe = server.createFeed(keyMe)
  let feedOther = server.createFeed(keyOther)
  
  const book = { type: 'bookclub', title: 'The Disposessed', authors: 'Ursula Le Guin' }
  const myBookReview = { type: 'bookclubUpdate', rating: '4' }
  const otherBookReview = { type: 'bookclubUpdate', rating: '5' }
  const myReviewComment = { type: 'bookclubComment', text: 'Really?' }

  feedMe.add(book, (err, bookMsg) => {
    if (err) console.error(err)
    
    myBookReview.updates = bookMsg.key
    feedMe.add(myBookReview, (err, updateMsg) => {
      if (err) console.error(err)
    
      otherBookReview.updates = bookMsg.key
      feedOther.add(otherBookReview, (err, updateMsg) => {
        if (err) console.error(err)

        pull(
          notifications(keyMe.id),
          pull.collect((err, updates) => {
            t.equal(updates.length, 1, 'only others update')
            t.equal(updates[0].value.author, keyOther.id, 'correct author')

            myReviewComment.root = myReviewComment.branch = updateMsg.key

            feedMe.add(myReviewComment, (err, commentMsg) => {
              if (err) console.error(err)

              pull(
                notifications(keyOther.id),
                pull.collect((err, updates) => {
                  t.equal(updates.length, 1, 'only update')
                  t.equal(updates[0].value.author, keyMe.id, 'correct author')
                  t.equal(updates[0].value.content.type, 'bookclubComment', 'the comment')

                  server.close()
                  t.end()
                })
              )
            })
          })
        )
      })
    })
  })
})

