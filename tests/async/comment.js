const test = require('tape')
const Server = require('scuttle-testbot')
const ssbKeys = require('ssb-keys')
const pull = require('pull-stream')

const keyMe = ssbKeys.generate()

Server.use(require('ssb-backlinks'))

const Get = require('../../async/get')
const Create = require('../../async/create')
const Update = require('../../async/update')
const Comment = require('../../async/comment')

test('async.comment - I publish a book and comment on a rating', t => {
  const server = Server({name: 'test.async.comment', keys: keyMe})
  const get = Get(server)
  const create = Create(server)
  const update = Update(server)
  const comment = Comment(server)

  const book = { type: 'bookclub', title: 'The Dispossessed', authors: 'Ursula Le Guin' }
  const bookRating = { type: 'bookclubUpdate', review: 'I liked it', rating: '5', ratingMax: '5', ratingType: ':star:'  }
  
  create(book, (err, bookMsg) => {
    if (err) console.error(err)

    get(bookMsg.key, true, (err, bookState) => {
      t.ok(true, "loading book with no subjective also works")
        
      update(bookMsg.key, bookRating, (err, updateMsg) => {
        if (err) console.error(err)

        get(bookMsg.key, true, (err, bookState) => {
          t.ok(true, "loading book with no comments also works")
          
          comment(updateMsg.key, null, 'Oh really?', (err, commentMsg) => {
            if (err) console.error(err)
            
            comment(updateMsg.key, commentMsg.key, 'Really', (err, commentMsgAuto) => {
              if (err) console.error(err)

              get(bookMsg.key, true, (err, bookState) => {
                t.equal(bookState.common.title, book.title, 'title correct')
                t.equal(bookState.subjective[keyMe.id].review, bookRating.review, 'review correct')
                t.equal(bookState.subjective[keyMe.id].comments.length, 2, 'get all comments')
                t.equal(bookState.subjective[keyMe.id].comments[0].content.text, 'Oh really?', 'comment 1 is correct')
                t.equal(bookState.subjective[keyMe.id].comments[1].content.text, 'Really', 'comment 2 is correct')

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

