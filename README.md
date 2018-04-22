# Scuttle-book

A helper module which covers all your ssb `book` related needs from fetching book data, creating new book entries, and validating whether a message is of a standard form.

The parts of this modules are : 
- queries/ getters
- publishing helpers 
- schemas

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

```js
{
  // TODO: REVISE THIS
  aboutWinner: function (sbot, attr, attrOpinions, cb) {
    // In the event there are differing opinions about a given book attribute, 
    // this function determines which one 'wins'.
    // By default, the fallback for attribute is :
    //    [ myOpinion, publishersOpinion, friendsOpinion, strangersOpinion ] 
    //    'friendsOpinion' is the most recent opinion by a friend
  }
}
```

## Instance API

### `book.async.create(book, cb)`

`book` - an Object which must at least have `title`, `author`. If a book doesn't pass the `isBook` validator, the callback is called with the errors : `cb(errors)`

### `book.async.update(id, attributes, cb)`
### `book.async.comment(id, text, cb)`

### `book.sync.isBook(bookMsg)`

Checks if a given message is a valid book message, where a 'message' can be either a raw message from the database or `msg.value.content`.

This method doesn't need an sbot connection so can be accessed directly like:

```js
const isBook = require('scuttle-book/isBook')
```

### `book.sync.isBookUpdate(updateMsg)`

Checks if a given message is a valid book update message, where a 'message' can be either a raw message from the database or `msg.value.content`.

As with sync.isBook this doesn't need an sbot connection.

### `book.async.isBookKey(key, cb)`

Looks up a `key` to see if it belongs to a valid book message.

### `book.isBookComment(postMsg, cb)`

Check if it's a `post` message, and directed at a valid book message.

### `book.pull.books()`

A stream of all books. These are just raw book messages.

### `book.pull.comments()`

A stream of comments on books

### `book.pull.updates()`

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

Similar to `book.obs.get` but an asynchronous method for e.g. backend rendering.

### `book.obs.shelves()`

### `book.obs.authors()`



## Schemas

A new book:
```js
{
  type:       'bookclub',
  title:       String,
  authors:     String | Array,
  description: String,  (optional)
  image:       Object,  (optional)
  series:      String,  (optional)
  seriesNo:    Number   (optional)
  review:      String,  (optional)
  rating,      String,  (optional)
  ratingMax,   String,  (optional)
  ratingType,  String,  (optional)
  shelves:     String | Array,
  genres:     String | Array,
}
```

Updating a book :
```js
{
  type:       'bookclubUpdate',
  updates:     MessageId,    // the original book id
  title:       String,  (optional)
  authors:     String,  (optional)
  description: String,  (optional)
  image:       Object,  (optional)
  series:      String,  (optional)
  seriesNo:    Number,  (optional)
  review:      String,  (optional)
  rating,      String,  (optional)
  ratingMax,   String,  (optional)
  ratingType,  String,  (optional)
  shelves:     String | Array,
  genres:     String | Array,
}
```

Commenting on a book:
```js
{
  type: 'post',
  root: MessageId,    // the original book id
  text: String,
  branch: String | Array
}
```

## Development

Run the tests with `npm test`

Some tests require an sbot to be running and currently use your personal identity to read real books.
TODO - build a test harness with an in-memory db.

