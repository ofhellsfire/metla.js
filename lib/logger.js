'use strict'

const fs = require('fs')
const loglevelnext = require('loglevelnext')

const { name } = require('../package.json')

// TODO: looks like a workaround, rework toward using native logger mechanism
function addHandler (filename) {
  const outputFileStream = fs.createWriteStream(filename, { flags: 'a' })

  const originalWrite = process.stdout.write
  const originalError = process.stderr.write

  process.stdout.write = function () {
    originalWrite.apply(process.stdout, arguments)
    outputFileStream.write.apply(outputFileStream, arguments)
  }

  process.stderr.write = function () {
    originalError.apply(process.stderr, arguments)
    outputFileStream.write.apply(outputFileStream, arguments)
  }
}

function getLogger () {
  if (global.logger === undefined) {
    global.logger = loglevelnext.create(
      {
        id: name,
        name: name,
        prefix: { time: () => new Date().toISOString() },
        level: 'info'
      }
    )
  }
  return global.logger
}

module.exports = {

  getLogger: getLogger,

  initLogger: (filename, verbose, silent) => {
    global.logger = getLogger()
    addHandler(filename)
    if (verbose) {
      global.logger.enable()
    }
    if (silent) {
      global.logger.disable()
    }
    return global.logger
  }

}
