const test = require('tape')

const isBook = require('../../sync/isBook')()
// or const isBook = require('../../isBook')

test('isBook / book schema', t => {

  const simpleBook = {
    type: 'bookclub',
    authors: 'Ursula le Guin',
    title: 'The Dispossessed'
  }
  t.ok(isBook(simpleBook), 'validates simple book')

  const incompleteBook = {
    type: 'bookclub',
    authors: 'Ursula le Guin'
  }
  t.notOk(isBook(incompleteBook), 'invalidates incompleteBook book')
  t.equal(isBook.errors[0].message, 'is required', 'provides error messages')

  const multiAuthorBook = {
    type: 'bookclub',
    authors: ['Ursula le Guin', 'Terry Pratchett'],
    title: 'The Dispossessed'
  }
  t.ok(isBook(multiAuthorBook), 'validates multi-author book')

  const completeBook = {
    type: 'bookclub',
    authors: 'Ursula le Guin',
    title: 'The Dispossessed',
    series: '',
    seriesNo: '',
    description: 'A goodie',
    image: {
      link: "&a9RiJHjzC/AZnZbBUKydTCfuHVeGEmQjTFaVPwt3MmM=.sha256",
      name: "disposessed.jpg",
      size: 43390,
      type: "image/jpeg"
    }
  }
  t.ok(isBook(completeBook), 'validates a book with all attributes')

  t.end()
})

