const inject = require('scuttle-inject')
const merge = require('lodash.merge')

const raw = require('./methods')
const PLUGIN_DEPS = ['backlinks']

const niceMappings = {
  get: raw.async.get,
}

module.exports = function (server, opts) {
  const methods = merge(niceMappings, raw)

  return inject(server, methods, PLUGIN_DEPS)
}
