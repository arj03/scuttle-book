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

### `book.async.update(bookId, attributes, cb)`

Validates and posts an update to an existing book.

### `book.async.comment(updateId, latestCommentId, text, cb)`

Validates and posts a comment.

`latestCommentId` is optional, if not provided, it will be calculated.

### `book.pull.books(opts, hydrate, loadComments)`

A stream of all books. If hydrate is passed, all changes to books will
also be loaded and the final state of each book returned. Otherwise
raw book messages are returned.

FIXME: live instead of updates?

### `book.pull.comments()`

A stream of comments on books

### `book.pull.updates()`

A stream of updates on books. You can filter this yourself to pull out just ratings, or description updates etc).

FIXME: other helpers: shelves, authors, users

### `book.async.get(key, loadComments, cb)`

Gets a reduced state of the 'book as a whole' of the form:

``` js
{
  key: MessageId,
  title: String,
  description: String,
  authors: [ String, String, ... ],
  images: [ Image, Image, ... ] // Objects of same form as image property
  series: String, // the name of the series
  seriesNo: String, // the book number

  subjective: { FeedId: {
    review: String,
    rating: String, // e.g. 4
    ratingMax: String, // out of, e.g. 5
    ratingType: String, // text or emoticon
    shelves: [ String, String, .... ],
    genres:  [ String, String, .... ]
    }, ...
  }
}
```

FIXME:

  heads: [ MessageId, .... ], // most recent message(s) in the document/ thread
  threads: [ MessageId, ... ] // all backlinks in causal order


## Schemas

See [ssb-book-schema](https://github.com/arj03/ssb-book-schema/)

## Development

Run the tests with `npm test`

Some tests require an sbot to be running and currently use your personal identity to read real books.
TODO - build a test harness with an in-memory db.

