'use strict'

const fs = require('fs').promises
const path = require('path')

const {
  CannotReadDirectoryError,
  CannotGetFileStatError,
  NotSupportedModeError
} = require('./errors')
const getLogger = require('./logger').getLogger

const log = getLogger()

async function getStats (itemPath) {
  try {
    const stats = await fs.lstat(itemPath)
    return stats
  } catch (err) {
    throw new CannotGetFileStatError(err.message)
  }
}

class Metla {
  constructor (items) {
    this.items = items
  }

  static async init (dirPath) {
    const dirItems = await Metla._getDirectoryItems(dirPath)
    const items = await Metla._getFileProperties(dirItems)
    return new Metla(items)
  }

  static async _getDirectoryItems (dirPath) {
    try {
      let items = await fs.readdir(dirPath, { withFileTypes: true })
      items = items.map(item => {
        item.name = path.join(dirPath, item.name)
        return item
      })
      return items
    } catch (err) {
      throw new CannotReadDirectoryError(err.message)
    }
  }

  static async _getFileProperties (items) {
    return Promise.all(
      items.map(async (item) => {
        const filePath = item.name
        const stats = await getStats(filePath)
        stats.path = filePath
        return stats
      })
    )
  }

  filterSymLinksOut () {
    this.items = this.items.filter(item => {
      return !item.isSymbolicLink()
    })
    return this
  }

  filterByRegExp (tmpl) {
    this.items = this.items.filter(item => {
      const re = new RegExp(tmpl)
      return re.test(item.path)
    })
    return this
  }

  filterDirsOut () {
    this.items = this.items.filter(item => {
      return item.isFile()
    })
    return this
  }

  // TODO: how it can be refactored without if/else branching?
  sortItemsBy (mode) {
    this.items = this.items.sort((a, b) => {
      let [first, second] = [a[mode], b[mode]]
      if (typeof first === 'string' && typeof second === 'string') {
        first = first.toLowerCase()
        second = second.toLowerCase()
        return second.localeCompare(first)
      } else if (typeof first === 'number' && typeof second === 'number') {
        return second - first
      } else {
        throw new NotSupportedModeError(`unknown mode "${mode}"`)
      }
    })
    return this
  }

  keepItems (keepCount) {
    this.items = this.items.slice(keepCount)
    return this
  }

  async deleteItems (noop) {
    await Promise.all(
      this.items.map(async (item) => {
        if (!noop) {
          await fs.unlink(item.path)
          log.info(`file '${item.path}' has been deleted`)
        } else {
          log.info(`will delete '${item.path}' file`)
        }
      })
    )
  }
}

module.exports = {
  Metla
}
