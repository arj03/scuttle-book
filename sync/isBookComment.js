const validator = require('is-my-json-valid')
const schema = require('../schema/bookComment')

module.exports = validator(schema)

