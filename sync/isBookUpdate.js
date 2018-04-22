const validator = require('is-my-json-valid')
const schema = require('../schema/bookUpdate')

// server is not used here. Closure pattern is just for consistency of use with other functions.
module.exports = function (server) {
  const isBookUpdateValid = validator(schema, {verbose: true})

  return function isBookUpdate (obj) {
    const result = isBookUpdateValid(getMsgContent(obj))

    // exposes error messages provided by is-my-json-valid
    isBookUpdate.errors = isBookUpdateValid.errors

    return result
  }
}

function getMsgContent (obj) {
  if (obj.value && obj.value.content) return obj.value.content

  return obj
}

