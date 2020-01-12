'use strict'

/*

Configuration Precedence and Overriding

  |-----------------------------------|
  |     options from Command Line     |  < == Highest
  |-----------------------------------|
  |  --conf option from Command Line  |
  |  (external custom configuration)  |
  |-----------------------------------|
  |     ${HOME}/.config/metla.ini     |
  |-----------------------------------|
  |   default built-in configuration  |
  |-----------------------------------|  < == Lowest

*/

const fs = require('fs')
const os = require('os')
const path = require('path')

const ini = require('ini')

const defaultConfig = require('./default-config')
const modes = require('./modes')
const { name } = require('../package.json')

const defaultConfigPath = path.join(os.homedir(), '.config', `${name}.ini`)

function loadConfig (configPath) {
  try {
    fs.accessSync(configPath, fs.constants.F_OK | fs.constants.R_OK)
    const iniConf = ini.parse(fs.readFileSync(configPath, 'utf-8'))
    // TODO: clean it
    if (Object.prototype.hasOwnProperty.call(iniConf, 'keep')) {
      iniConf.keep = parseInt(iniConf.keep)
    }
    return iniConf
  } catch (err) {
    return {}
  }
}

function getDefaultConfig () {
  const defaultExtConfig = loadConfig(defaultConfigPath)
  return Object.assign({}, defaultConfig, defaultExtConfig)
}

function mergeConfig (defaultConf, extConf, args) {
  return Object.assign({}, defaultConf, extConf, args)
}

function buildConfig (args) {
  const defaultConfig = getDefaultConfig()
  const extConfigPath = ('conf' in args) ? args.conf : defaultConfigPath
  const extConfig = loadConfig(extConfigPath)
  return mergeConfig(defaultConfig, extConfig, args)
}

module.exports = {

  buildConfig: buildConfig,

  setMode: (mode) => {
    return (mode === 'lastmod' ||
            mode === 'lexorder') ? modes[mode] : modes.lastmod
  },

  defaultConfigPath: defaultConfigPath,

  loadConfig: loadConfig

}
