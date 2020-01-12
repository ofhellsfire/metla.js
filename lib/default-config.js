'use strict'

const path = require('path')

const modes = require('./modes')
const { name } = require('../package.json')

const defaultConfig = {
  log: path.join(process.cwd(), `${name}.log`),
  mode: modes.lastmod,
  tmpl: '^$',
  keep: 3,
  path: process.cwd()
}

module.exports = defaultConfig
