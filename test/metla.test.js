'use strict'

const fs = require('fs')
const path = require('path')

const chai = require('chai')
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)
const sleep = require('sleep')

const { deleteFolderRecursive } = require('./helpers')
const Metla = require('../lib/metla').Metla
const { CannotReadDirectoryError,
        CannotGetFileStatError,
        NotSupportedModeError } = require('../lib/errors')


describe('Metla', () => {

  let testmetla
  let rootTmpPath
  const filenames = [
    ['file_pattern_03.zip', 'file'],
    ['file_pattern_01.zip', 'file'],
    ['file_pattern_02.zip', 'file'],
    ['invalid_pattern_0x.ext', 'file'],
    ['file_pattern_04.zip', 'dir'],
    ['file_pattern_00.zip', 'symlink']
  ]

  const filenamesOnly = filenames.map(item => {
    const [name, _] = item
    return name
  })

  before(() => {
    // create temporary folder
    rootTmpPath = fs.mkdtempSync('metlatest')
    // create several temporary files with various extensions
    filenames.forEach(item => {
      const [name, type] = item
      const filePath = path.join(rootTmpPath, name)
      if (type === 'file') {
        fs.closeSync(fs.openSync(filePath, 'w'))
        sleep.msleep(200)
      } else if (type === 'dir') {
        fs.mkdirSync(filePath)
      } else if (type === 'symlink') {
        fs.symlinkSync(
          path.join(filenamesOnly[1]),
          path.join(rootTmpPath, name)
        ) 
      }
    })
  })

  after(() => {
    deleteFolderRecursive(rootTmpPath)
  })

  beforeEach(async () => {
    testmetla = await Metla.init(rootTmpPath)
  })

  it('should properly return Metla instance', async () => {
    testmetla.items.map(item => {
      return item.path
    }).should.be.deep.equal([
      path.join(rootTmpPath, 'file_pattern_00.zip'),
      path.join(rootTmpPath, 'file_pattern_01.zip'),
      path.join(rootTmpPath, 'file_pattern_02.zip'),
      path.join(rootTmpPath, 'file_pattern_03.zip'),
      path.join(rootTmpPath, 'file_pattern_04.zip'),
      path.join(rootTmpPath, 'invalid_pattern_0x.ext')
    ])
  })

  it('should throw exception if directory does not exist', () => {  // TODO: does it make sense to test all available reasons?
    chai.assert.isRejected(
      Metla.init('not-existing-folder'),
      CannotReadDirectoryError,
      /no such file or directory/
    )
  })

  it('should throw exception if unable to get file properties', () => {  // TODO: does it make sense to test all available reasons?
    const dirItems = [
      {name: '/not/existing/path'}
    ]
    chai.assert.isRejected(  // TODO: change to proper async raise assert
      Metla._getFileProperties(dirItems),
      CannotGetFileStatError,
      /no such file or directory/
    )
  })

  describe('Filters & Actions', () => {

    beforeEach(() => {
      const filenames = [
        {name: path.join(rootTmpPath, 'file_pattern_00.zip')},
        {name: path.join(rootTmpPath, 'file_pattern_01.zip')},
        {name: path.join(rootTmpPath, 'file_pattern_02.zip')},
        {name: path.join(rootTmpPath, 'file_pattern_03.zip')},
        {name: path.join(rootTmpPath, 'file_pattern_04.zip')},
        {name: path.join(rootTmpPath, 'invalid_pattern_0x.ext')}
      ]
      const dirItems = filenames.map(item => {
        const stats = fs.lstatSync(item.name)
        stats.path = item.name
        return stats
      })
      testmetla.items = dirItems
    })

    it('should return filenames without symlinks', () => {
      const fileProps = testmetla.filterSymLinksOut()
      fileProps.items.map(item => {
        return item.path
      }).should.be.deep.equal([
        path.join(rootTmpPath, 'file_pattern_01.zip'),
        path.join(rootTmpPath, 'file_pattern_02.zip'),
        path.join(rootTmpPath, 'file_pattern_03.zip'),
        path.join(rootTmpPath, 'file_pattern_04.zip'),
        path.join(rootTmpPath, 'invalid_pattern_0x.ext')        
      ])
    })

    it('should return filtered items by regexp', () => {
      const regexp = /file_pattern_\d{2}[.]zip/
      const filteredItems = testmetla.filterByRegExp(regexp).items.map(
        item => {
          return item.path
        }
      )
      filteredItems.should.be.deep.equal([
        path.join(rootTmpPath, 'file_pattern_00.zip'),
        path.join(rootTmpPath, 'file_pattern_01.zip'),
        path.join(rootTmpPath, 'file_pattern_02.zip'),
        path.join(rootTmpPath, 'file_pattern_03.zip'),
        path.join(rootTmpPath, 'file_pattern_04.zip')
      ])
    })

    it('should return items without directories', () => {
      const dirlessItems = testmetla.filterDirsOut().items.map(item => {
        return item.path
      })
      dirlessItems.should.be.deep.equal([
        path.join(rootTmpPath, 'file_pattern_01.zip'),
        path.join(rootTmpPath, 'file_pattern_02.zip'),
        path.join(rootTmpPath, 'file_pattern_03.zip'),
        path.join(rootTmpPath, 'invalid_pattern_0x.ext')
      ])
    })

  })

  describe('Ordering & Deletion', () => {

    let filenames

    beforeEach(() => {
      filenames = [
        {name: path.join(rootTmpPath, 'file_pattern_03.zip')},
        {name: path.join(rootTmpPath, 'file_pattern_01.zip')},
        {name: path.join(rootTmpPath, 'file_pattern_02.zip')}
      ]
      const dirItems = filenames.map(item => {
        const stats = fs.lstatSync(item.name)
        stats.path = item.name
        return stats
      })
      testmetla.items = dirItems
    })

    it('should return sorted items in lexicograhic order', () => {
      const sortedItems = testmetla.sortItemsBy('path').items.map(item => {
        return item.path
      })
      sortedItems.should.be.deep.equal([
        path.join(rootTmpPath, 'file_pattern_03.zip'),
        path.join(rootTmpPath, 'file_pattern_02.zip'),
        path.join(rootTmpPath, 'file_pattern_01.zip')
      ])
    })

    it('should return sorted items by last modified order', () => {
      const sortedItems = testmetla.sortItemsBy('mtimeMs').items.map(item => {
        return item.path
      })
      sortedItems.should.be.deep.equal([
        path.join(rootTmpPath, 'file_pattern_02.zip'),
        path.join(rootTmpPath, 'file_pattern_01.zip'),
        path.join(rootTmpPath, 'file_pattern_03.zip')
      ])
    })

    it('should throw error for unknown sorting mode', () => {
      const mode = 'unknown'
      chai.expect(() => {
        testmetla.sortItemsBy(mode)
      }).to.throw(NotSupportedModeError, `unknown mode "${mode}"`)
    })

    it('should return items without first X count', () => {
      const processedItems = testmetla.keepItems(2).items.map(item => {
        return item.path
      })
      processedItems.length.should.be.equal(1)
      processedItems.should.be.deep.equal([
        path.join(rootTmpPath, 'file_pattern_02.zip')
      ])
    })

    it('should not delete files, only print message', async () => {
      global.logger.disable()  // turn off stdout
      await testmetla.deleteItems(true)
      filenames.map(item => {
        try {
          fs.accessSync(item.name)
        } catch (err) {
          chai.assert.fail(`File "${item.path}" has been deleted`)
        }
      })
    })

    it('should delete files', async () => {
      global.logger.disable()  // turn off stdout
      await testmetla.deleteItems(false)
      filenames.map(item => {
        try {
          fs.accessSync(item.name)
          chai.assert.fail(`File "${item.name}" has not been deleted`)
        } catch (err) {
          // do nothing, we expect file to be missing
        }
      })
    })

  })

  it('should throw error if deletion fails', async () => {
    const filenames = [
      {name: path.join(rootTmpPath, 'file_pattern_10.gzip')}
    ]
    const dirItems = filenames.map(item => {
      fs.closeSync(fs.openSync(item.name, 'w'))
      const stats = fs.lstatSync(item.name)
      fs.unlinkSync(item.name)
      stats.path = item.name
      return stats
    })
    testmetla.items = dirItems

    chai.assert.isRejected(  // TODO: change to proper async raise assert
      testmetla.deleteItems(false),
      Error,
      /no such file or directory/
    )
  })

})
