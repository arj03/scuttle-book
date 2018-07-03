const validator = require('is-my-json-valid')
const schema = require('../schema/book')

// server is not used here. Closure pattern is just for consistency of use with other functions.
module.exports = function (server) {
  const isBookContent = validator(schema, {verbose: true})

  return function isBook (obj) {
    const result = isBookContent(getMsgContent(obj))

    // exposes error messages provided by is-my-json-valid
    isBook.errors = isBookContent.errors

    return result
  }
}

function getMsgContent (obj) {
  if (obj.value && obj.value.content) return obj.value.content

  return obj
}

