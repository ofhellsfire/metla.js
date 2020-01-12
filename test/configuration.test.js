'use strict'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')

const should = require('chai').should()

const config = require('../lib/config')
const defaultConfig = require('../lib/default-config')
const modes = require('../lib/modes')


describe('Configuration', () => {

  let rootTmpPath
  let tmpConfigPath

  before(() => {
    rootTmpPath = fs.mkdtempSync('metlatest')
    tmpConfigPath = path.join(rootTmpPath, 'test.ini')
  })

  after(() => {
    fs.unlinkSync(tmpConfigPath)
    fs.rmdirSync(rootTmpPath)
  })

  it('should return default config with specific values', () => {
    defaultConfig.should.be.deep.equal(
      {
        log: path.join(process.cwd(), 'metla.log'),
        mode: modes.lastmod,
        tmpl: '^$',
        keep: 3,
        path: process.cwd()
      }
    )
  })

  it('should return expected default config path', () => {
    config.defaultConfigPath.should.be.equal(
      path.join(os.homedir(), '.config', 'metla.ini')
    )
  })

  it('should successfully load config', () => {
    fs.writeFileSync(
      tmpConfigPath,
      "path=/tmp/\ntmpl=''\nkeep=4\nmode=lastmod\nlog=metla.log",
      'utf-8'
    )
    const conf = config.loadConfig(tmpConfigPath)
    conf.should.be.deep.equal(
      {
        path: '/tmp/',
        tmpl: '',
        keep: 4,
        mode: 'lastmod',
        log: 'metla.log'
      }
    )
  })

  it('should return empty object if config file can not be read', () => {
    const conf = config.loadConfig('non-existing-path')
    conf.should.be.deep.equal({})
  })

  it('should return config from args', () => {
    const cliArgs = {
      path: '/path/to/anywhere',
      tmpl: 'yourregexp',
      keep: 2,
      mode: 'lexorder',
      log: '/path/to/my/logs'
    }
    const conf = config.buildConfig(cliArgs)
    conf.should.be.deep.equal(cliArgs)
  })

  it('should return external custom configuration' + 
     '(without "keep" parameter)', () => {
    fs.writeFileSync(
      tmpConfigPath,
      "path=/tmp/to/some/\ntmpl='some regexp'\nmode=lexorder\nlog=kustom.log",
      'utf-8'
    )
    const cliArgs = { conf: tmpConfigPath }
    const conf = config.buildConfig(cliArgs)
    conf.should.be.deep.equal({
      path: '/tmp/to/some/',
      tmpl: 'some regexp',
      mode: 'lexorder',
      keep: 3,
      log: 'kustom.log',
      conf: tmpConfigPath
    })
  })

  describe('Configuration Precedence', () => {

    let defaultConfigPathForTest
    let wasRenamed

    beforeEach(() => {
      defaultConfigPathForTest = path.join(
        os.homedir(), '.config', 'metla.ini'
      )
      wasRenamed = false
      try {
        fs.accessSync(defaultConfigPathForTest)
        fs.renameSync(defaultConfigPathForTest,
                      `${defaultConfigPathForTest}.bak`)
        wasRenamed = true
      } catch (error) {
        if (error.code === 'ENOENT') {
          // we can safely execute the test
        } else {
          assert.fail(`Something is wrong, we should not get here:
                       Unexpected Exception "${error.code}"`)
        }
      }
    })

    afterEach(() => {
      if (wasRenamed) {
        fs.renameSync(`${defaultConfigPathForTest}.bak`,
                      defaultConfigPathForTest)
      } else {
        try {
          fs.unlinkSync(defaultConfigPathForTest)
        } catch (error) {
          if (error.code === 'ENOENT') {
            // we can safely ignore it
          } else {
            assert.fail(`Something is wrong, we should not get here:
                         Unexpected Exception "${error.code}"`)
          }
        }
      }
    })

    it('should return default config if no args supplied ' +
       'and if no config at ~/.config/metla.ini', () => {
      const cliArgs = {}
      const conf = config.buildConfig(cliArgs)
      conf.should.be.deep.equal(defaultConfig)
    })

    it('should return default ini config if no args supplied', () => {
      fs.writeFileSync(
        defaultConfigPathForTest,
        "path=/some/path/\ntmpl='some regexp'\nkeep=10\n" +
        "mode=lastmod\nlog=custom.log",
        'utf-8'
      )
      const cliArgs = {}
      const conf = config.buildConfig(cliArgs)
      conf.should.be.deep.equal({
        path: '/some/path/',
        tmpl: 'some regexp',
        keep: 10,
        mode: 'lastmod',
        log: 'custom.log'
      })
    })

    it('should return overriden config ' + 
       'if various config parts supplied', () => {
      fs.writeFileSync(
        defaultConfigPathForTest,
        "path=/some/path/\nkeep=10\nmode=lexorder",
        'utf-8'
      )
      const cliArgs = { path: '/path/to/anywhere', keep: 15 }
      const conf = config.buildConfig(cliArgs)
      conf.should.be.deep.equal({
        path: '/path/to/anywhere',
        tmpl: '^$',
        keep: 15,
        mode: 'lexorder',
        log: path.join(process.cwd(), 'metla.log')
      })
    })

  })

})