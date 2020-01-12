'use strict'

const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

const chai = require('chai')
const sleep = require('sleep')

const { deleteFolderRecursive } = require('./helpers')


describe('System Tests', () => {

  let rootTmpDir
  let logPath
  const rootCmd = 'node index.js'
  const workDir = path.join(__dirname, '..')
  const filenames = [
    'one.txt',
    'five.txt',
    'three.txt',
    'two.txt',
    'four.txt'
  ]
  const logName = 'test.log'

  before(() => {
    rootTmpDir = fs.mkdtempSync('metlatest')
    logPath = path.join(rootTmpDir, logName)
    filenames.forEach(item => {
      const filePath = path.join(rootTmpDir, item)
      fs.closeSync(fs.openSync(filePath, 'w'))
      sleep.msleep(200)
    })
  })

  after(() => {
    deleteFolderRecursive(rootTmpDir)
  })

  it('should output error message when both --verbose and --silent', () => {
    try {
      child_process.execSync(
        `${rootCmd} --verbose --silent`, { cwd: workDir }
      )
      chai.assert.fail('Must throw error')
    } catch (err) {
      const output = err.stderr.toString()
      output.should.include(
        'Ambiguous options: cannot use --verbose and --silent simultaneously'
      )
      err.status.should.be.not.equal(0)
    }
  })

  it('should output files to be deleted ' + 
     'without physical removal (noop)', () => {
    const result = child_process.execSync(
      `${rootCmd} --path ${rootTmpDir} --keep 3 --tmpl '.+[.]txt' ` + 
      `--log ${logPath} --noop`, { cwd: workDir }
    )
    const expected = ['five.txt', 'one.txt']
    expected.forEach(item => {
      result.toString().should.include(
        `will delete '${path.join(rootTmpDir, item)}' file`
      )
    })
    const output = child_process.execSync(`ls ${rootTmpDir}`, { cwd: workDir })
    filenames.forEach(item => {
      output.toString().should.include(item)
    })
  })

  it('should output more log details for verbose mode', () => {
    const result = child_process.execSync(
      `${rootCmd} --path ${rootTmpDir} --keep 3 --tmpl '.+[.]txt' ` + 
      `--log ${logPath} --noop --verbose`, { cwd: workDir }
    )
    result.toString().should.include('started with config')
  })

  it('should suppress output for silent mode', () => {
    const result = child_process.execSync(
      `${rootCmd} --path ${rootTmpDir} --keep 3 --tmpl '.+[.]txt' ` + 
      `--log ${logPath} --noop --silent`, { cwd: workDir }
    )
    result.toString().should.be.equal('')
  })

  it('should create log file at stated path', () => {
    const result = child_process.execSync(
      `${rootCmd} --path ${rootTmpDir} --keep 3 --tmpl '.+[.]txt' ` + 
      `--log ${logPath} --noop --verbose`, { cwd: workDir }
    )
    const output = child_process.execSync(`ls ${rootTmpDir}`, { cwd: workDir })
    output.toString().should.include(logName)
  })

  it('should output files that have been deleted ' + 
     'with physical removal', () => {
    const result = child_process.execSync(
      `${rootCmd} --path ${rootTmpDir} --keep 3 --tmpl '.+[.]txt' ` + 
      `--log ${logPath}`, { cwd: workDir }
    )
    const expectDeleted = ['five.txt', 'one.txt']
    expectDeleted.forEach(item => {
      result.toString().should.include(
        `file '${path.join(rootTmpDir, item)}' has been deleted`
      )
    })
    const output = child_process.execSync(`ls ${rootTmpDir}`, { cwd: workDir })
    const expectRemain = ['two.txt', 'three.txt', 'four.txt']
    expectRemain.forEach(item => {
      output.toString().should.include(item)
    })
  })

  it('should output files that have been deleted using lexorder mode', () => {
    const result = child_process.execSync(
      `${rootCmd} --path ${rootTmpDir} --keep 1 --tmpl '.+[.]txt' ` + 
      `--log ${logPath} --mode lexorder`, { cwd: workDir }
    )
    const expected = ['four.txt', 'three.txt']
    expected.forEach(item => {
      result.toString().should.include(
        `file '${path.join(rootTmpDir, item)}' has been deleted`
      )
    })
    const output = child_process.execSync(`ls ${rootTmpDir}`, { cwd: workDir })
    output.toString().should.include('two.txt')
  })

  it('should output error message for inaccessible path', () => {
    try {
      child_process.execSync(
        `${rootCmd} --path not-existing-path --keep 3 --tmpl '.+[.]txt' ` + 
        `--log ${logPath} --noop`, { cwd: workDir }
      )
    } catch (err) {
      const output = err.stderr.toString()
      output.should.include('CannotReadDirectoryError')
      err.status.should.be.equal(1)
    }
  })

  it('should output error for invalid regular expression', () => {
    try {
      child_process.execSync(
        `${rootCmd} --path ${rootTmpDir} --keep 3 --tmpl '.+[' ` + 
        `--log ${logPath} --noop`, { cwd: workDir }
      )
    } catch (err) {
      const output = err.stderr.toString()
      output.should.include('Invalid regular expression')
      err.status.should.be.equal(1)
    }
  })

})
