const bookSchema = require('./book')

console.log(bookSchema)

module.exports = {
  $schema: 'http://json-schema.org/schema#',
  "definitions": {
    book: bookSchema
  },
  type: 'object',
  properties: {
    allOf: [
      { "$ref": "#/definitions/book" },
      { "properties": { type: {type: 'string', pattern: 'about'} } }
    ]
  },
  required: ["type", "about"]
}

