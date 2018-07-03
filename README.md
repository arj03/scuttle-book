# Scuttle-book

A helper module which covers all your ssb `book` related needs from fetching book data, creating new book entries, and validating whether a message is of a standard form.

The parts of this modules are : 
- queries / getters
- publishing helpers 

## Usage

```js
const Book = require('scuttle-book')
const book = Book(server)   // server is sometimes called sbot

const newBook = {
  title: 'The Dispossessed',
  author: 'Ursula le Guin'
}

book.async.create(newBook, (err, bookMsg) => {
  if (err) // handle error

  book.isBook(bookMsg)
  // => true
})

```

## Constructor API

### `Book(server, opts)`

`server` is a connection to your scuttlebutt server provided by `ssb-client` (sometimes called sbot in other docs).

`opts` (options) an Object with over-ride options for the scuttle-book instance: 

## Instance API

### `book.async.create(book, cb)`

`book` - an Object which must at least have `title`, `author`. If a book doesn't pass the `isBook` validator, the callback is called with the errors : `cb(errors)`

### `book.async.update(id, attributes, cb)`

FIXME

### `book.async.comment(id, text, cb)`

FIXME

### `book.sync.isBook(bookMsg)`

FIXME: rewrite to use ssb-book-schema

Checks if a given message is a valid book message, where a 'message' can be either a raw message from the database or `msg.value.content`.

This method doesn't need an sbot connection so can be accessed directly like:

```js
const isBook = require('scuttle-book/isBook')
```

### `book.sync.isBookUpdate(msg, cb)`

FIXME: rewrite to use ssb-book-schema

Check if it's a book update, either `about` or `bookclubUpdate` message, and directed at a valid book message.

### `book.sync.isBookComment(postMsg, cb)`

FIXME: rewrite to use ssb-book-schema

Check if it's a `post` message, and directed at a valid book message.

### `book.pull.books()`

FIXME

A stream of all books. These are just raw book messages.

FIXME: list of hydrated books maybe?

### `book.pull.comments()`

FIXME

A stream of comments on books

### `book.pull.updates()`

FIXME

A stream of updates on books. You can filter this yourself to pull out just ratings, or description updates etc).

### `book.obs.get(key)`

Returns an observeable which provides live updating data for a particular book.

```js
var favBook = book.obs.get('%A4RPANAIiCtO9phwbL0tqk9ta4ltzzZwECZjsH25rqY=.sha256"')

favBook( function listener (newBookState) {
  // this function is passed the newBookState whenever there's an update
})

favBook()
// => get the state right now

```

state has form:
```js
// {
//   key: '%A4RPANAIiCtO9phwbL0tqk9ta4ltzzZwECZjsH25rqY=.sha256',
//   value: {  },          // the original message content
//   attributes: {  },     // contains the single 'winning' state for each attr
//   comments: [ ],        // the collection of replies in the order they were published
//   latestAttributes: { } // the latest state of each attribute from each peer
// }
```

where `attributes` and `latestAttributes`:
```js
{
  title:       String,
  authors:     String | Array,
  description: String,
  image:       Blob,
  series:      String,
  seriesNo:    Number,
  review,
  rating,      
  ratingMax,  
  ratingType,
  shelve, // this one may not make any sense!
  genre
}
```

### `book.async.get(key, cb)`

FIXME

Similar to `book.obs.get` but an asynchronous method for e.g. backend rendering.

### `book.obs.shelves()`

FIXME

### `book.obs.authors()`

FIXME


## Schemas

See [ssb-book-schema](https://github.com/arj03/ssb-book-schema/)

## Development

Run the tests with `npm test`

Some tests require an sbot to be running and currently use your personal identity to read real books.
TODO - build a test harness with an in-memory db.

