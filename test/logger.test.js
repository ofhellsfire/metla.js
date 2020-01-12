'use strict'

const fs = require('fs')
const path = require('path')

const chai = require('chai')
const sleep = require('sleep')

const { deleteFolderRecursive } = require('./helpers')
const logger = require('../lib/logger')
const { name } = require('../package.json')


describe('Logger', () => {

  let rootTmpPath

  before(() => {
    // create temporary folder
    rootTmpPath = fs.mkdtempSync('metlatest')
  })

  after(() => {
    deleteFolderRecursive(rootTmpPath)
  })

  it('should return default logger', () => {
    const log = logger.getLogger()
    log.name.should.be.equal(name)
    log.level.should.be.equal(2)
  })

  it('should initialize logger with no silent and no verbose', () => {
    const logFilePath = path.join(rootTmpPath, 'logger.test.log')
    const log = logger.initLogger(logFilePath, false, false)
    sleep.msleep(200)
    try {
      fs.accessSync(logFilePath)
      log.level.should.be.equal(2)
      log.error('Test error message')
    } catch (err) {
      chai.assert.fail(`Log file is not found at ${logFilePath}`)
    }
  })

  it('should initialize logger with verbose mode', () => {
    const logFilePath = path.join(rootTmpPath, 'logger.test.log')
    const log = logger.initLogger(logFilePath, true, false)
    log.level.should.be.equal(0)
  })

  it('should initialize logger with silent mode', () => {
    const logFilePath = path.join(rootTmpPath, 'logger.test.log')
    const log = logger.initLogger(logFilePath, false, true)
    log.level.should.be.equal(5)
  })

})
