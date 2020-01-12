'use strict'

const chai = require('chai')
const should = require('chai').should()

const config = require('../lib/config')
const modes = require('../lib/modes')


describe('Modes', () => {

  it('should return expected available modes', () => {
    modes.should.be.deep.equal({
        lastmod: 'mtimeMs',
        lexorder: 'path'
    })
  })

  it('should set lexorder mode', () => {
    const mode = config.setMode('lexorder')
    mode.should.be.equal('path')
  })

  it('should set lastmodified mode', () => {
    const mode = config.setMode('lastmod')
    mode.should.be.equal('mtimeMs')
  })

  it('should set default mode if unknown mode is given', () => {
    const mode = config.setMode('unknown mode')
    mode.should.be.equal('mtimeMs')
  })

})