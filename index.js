'use strict'

const args = require('commander')

const configManager = require('./lib/config')
const initLogger = require('./lib/logger').initLogger
const Metla = require('./lib/metla').Metla
const { description, name, version } = require('./package.json')

args
  .name(name)
  .version(version)
  .option('-p, --path <path>', 'path for files search')
  .option('-t, --tmpl <regex>', 'regexp expression to match file names')
  .option('-k, --keep <num>', 'number of files to keep')
  .option('-m, --mode <mode>', 'matched files ordering mode, ' +
          'valid values are: lastmod, lexorder; ' +
          'lastmod orders by modification date, ' +
          'lexorder orders lexicographically; default: lastmod')
  .option('-c, --conf <conf>', 'path to configuration file')
  .option('-l, --log <log>', 'path where log file is created/appended')
  .option('-n, --noop', 'do not perform deletion, ' +
          'show only what will be deleted', false)
  .option('-s, --silent', 'prevent logs from stdout', false)
  .option('-v, --verbose', 'enable verbose mode', false)
  .description(description)
  .parse(process.argv)

// TODO: can it be solved at CLI package level?
if (args.verbose && args.silent) {
  console.error(`Ambiguous options: cannot use --verbose and --silent ` +
                `simultaneously. Please specify either one or none.`)
  process.exit(1)
}

const config = configManager.buildConfig(args)

const log = initLogger(config.log, config.verbose, config.silent)
log.debug(`'${name}' started with config: ` +
          `{path: ${config.path}, tmpl: ${config.tmpl}, ` +
          `keep: ${config.keep}, mode: ${config.mode}, ` +
          `conf: ${config.conf}, log: ${config.log}, ` +
          `noop: ${config.noop}, silent: ${config.silent}, ` +
          `verbose: ${config.verbose}`)

// go through process steps, get items to be deleted and delete items
Metla.init(config.path)
  .then(metla => {
    metla
      .filterSymLinksOut()
      .filterByRegExp(config.tmpl)
      .filterDirsOut()
      // TODO: include handling into 'buildConfig'???
      .sortItemsBy(configManager.setMode(config.mode))
      .keepItems(config.keep)
    metla.deleteItems(config.noop)
  })

process.on('uncaughtException', err => {
  log.error(err.message)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  log.error(`${err.name}: ${err.message}`)
  process.exit(1)
})
