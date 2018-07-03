const validator = require('is-my-json-valid')
const schema = require('../schema/bookUpdate')

module.exports = validator(schema)

