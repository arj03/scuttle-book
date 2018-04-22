const test = require('tape')

const isBookUpdate = require('../../sync/isBookUpdate')()

test('isBookUpdate / book schema', t => {

  const simpleBookUpdate = {
    type: 'about',
    about: 'someid',
    authors: 'Ursula le Guin',
    title: 'The Dispossessed'
  }
  t.ok(isBookUpdate(simpleBookUpdate), 'validates simple book update')

  const incompleteBookUpdate = {
    type: 'about',
    authors: 'Ursula le Guin',
    title: 'The Dispossessed'
  }
  t.notOk(isBookUpdate(incompleteBookUpdate), 'invalidates incomplete book update')
  console.log(isBookUpdate)
  t.equal(isBookUpdate.errors[0].message, 'is required', 'provides error messages')

  const simpleBookReview = {
    type: 'about',
    about: 'someid',
    review: 'Long thoughtful words',
    rating: '5'
  }
  t.ok(isBookUpdate(simpleBookReview), 'validates simple book')

  t.end()
})

