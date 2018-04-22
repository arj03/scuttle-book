module.exports = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  properties: {
    type: {type: 'string', pattern: 'bookclubUpdate'},
    updates: {type: 'string'}
    // plus all of books optional properties
  },
  required: ["type", "updates"]
}

